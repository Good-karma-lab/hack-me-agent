import { and, eq, isNull, like } from "drizzle-orm";
import { db, ensureDatabase } from "@/lib/db";
import {
  agentRunEvents,
  agentRuns,
  approvalOperations,
  approvalRequests,
  inboxes,
  organizationInvites,
  integrations,
  knowledgeDocuments,
  memberships,
  organizations,
  ticketMessages,
  tickets,
  users,
} from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "./password";
import { slugify } from "@/lib/utils";
import { createHash, randomBytes } from "node:crypto";

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}

export async function getUserByEmail(email: string) {
  await ensureDatabase();

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user ?? null;
}

export async function validateUserCredentials(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  const valid = await verifyPassword(password, user.passwordHash);

  return valid ? user : null;
}

export async function createUserWithOrganization(input: {
  email: string;
  name: string;
  password: string;
  organizationName: string;
}) {
  await ensureDatabase();

  const existingUser = await getUserByEmail(input.email);

  if (existingUser) {
    throw new Error("An account with that email already exists.");
  }

  const passwordHash = await hashPassword(input.password);
  const userId = createId("usr");
  const organizationId = createId("org");
  const membershipId = createId("mem");
  const inboxId = createId("inb");
  const now = new Date();

  const slugBase = slugify(input.organizationName) || "workspace";
  const slug = await createUniqueOrganizationSlug(slugBase);

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id: userId,
      email: input.email,
      name: input.name,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    await tx.insert(organizations).values({
      id: organizationId,
      slug,
      name: input.organizationName,
      createdAt: now,
      updatedAt: now,
    });

    await tx.insert(memberships).values({
      id: membershipId,
      userId,
      organizationId,
      role: "owner",
      createdAt: now,
    });

    await tx.insert(inboxes).values({
      id: inboxId,
      organizationId,
      name: "Primary Inbox",
      channel: "email",
      createdAt: now,
    });

    await seedOrganizationData(tx, organizationId, inboxId, now);
  });

  return {
    userId,
    organizationSlug: slug,
  };
}

function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createOrganizationInvite(input: {
  organizationId: string;
  email: string;
  role: string;
  invitedByUserId: string;
}) {
  await ensureDatabase();
  const normalizedEmail = input.email.toLowerCase();

  const existingMembership = await db
    .select({ id: memberships.id })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(and(eq(memberships.organizationId, input.organizationId), eq(users.email, normalizedEmail)))
    .limit(1);

  if (existingMembership[0]) {
    throw new Error("That user is already a member of this workspace.");
  }

  const existingInvite = await db
    .select()
    .from(organizationInvites)
    .where(
      and(
        eq(organizationInvites.organizationId, input.organizationId),
        eq(organizationInvites.email, normalizedEmail),
        isNull(organizationInvites.acceptedAt),
      ),
    )
    .limit(1);

  if (existingInvite[0]) {
    throw new Error("There is already an active invite for that email.");
  }

  const token = randomBytes(24).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);

  await db.insert(organizationInvites).values({
    id: createId("inv"),
    organizationId: input.organizationId,
    email: normalizedEmail,
    role: input.role,
    invitedByUserId: input.invitedByUserId,
    tokenHash: hashInviteToken(token),
    expiresAt,
    createdAt: now,
  });

  return token;
}

export async function listOrganizationMembersAndInvites(organizationId: string) {
  await ensureDatabase();

  const [memberRows, inviteRows] = await Promise.all([
    db
      .select({
        membershipId: memberships.id,
        email: users.email,
        name: users.name,
        role: memberships.role,
      })
      .from(memberships)
      .innerJoin(users, eq(memberships.userId, users.id))
      .where(eq(memberships.organizationId, organizationId)),
    db
      .select()
      .from(organizationInvites)
      .where(and(eq(organizationInvites.organizationId, organizationId), isNull(organizationInvites.acceptedAt))),
  ]);

  return {
    members: memberRows,
    invites: inviteRows,
  };
}

export async function getInviteByToken(token: string) {
  await ensureDatabase();

  const [invite] = await db
    .select({
      id: organizationInvites.id,
      email: organizationInvites.email,
      role: organizationInvites.role,
      expiresAt: organizationInvites.expiresAt,
      acceptedAt: organizationInvites.acceptedAt,
      organizationId: organizations.id,
      organizationName: organizations.name,
      organizationSlug: organizations.slug,
    })
    .from(organizationInvites)
    .innerJoin(organizations, eq(organizationInvites.organizationId, organizations.id))
    .where(eq(organizationInvites.tokenHash, hashInviteToken(token)))
    .limit(1);

  return invite ?? null;
}

export async function acceptInviteWithNewUser(input: {
  token: string;
  name: string;
  password: string;
}) {
  await ensureDatabase();

  const invite = await getInviteByToken(input.token);

  if (!invite) {
    throw new Error("Invite not found.");
  }

  if (invite.acceptedAt) {
    throw new Error("Invite has already been accepted.");
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    throw new Error("Invite has expired.");
  }

  const existingUser = await getUserByEmail(invite.email);
  if (existingUser) {
    throw new Error("An account with that invited email already exists. Sign in first to join this workspace.");
  }

  const passwordHash = await hashPassword(input.password);
  const userId = createId("usr");
  const membershipId = createId("mem");
  const acceptedAt = new Date();

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id: userId,
      email: invite.email,
      name: input.name,
      passwordHash,
      createdAt: acceptedAt,
      updatedAt: acceptedAt,
    });

    await tx.insert(memberships).values({
      id: membershipId,
      userId,
      organizationId: invite.organizationId,
      role: invite.role,
      createdAt: acceptedAt,
    });

    await tx
      .update(organizationInvites)
      .set({ acceptedAt })
      .where(eq(organizationInvites.id, invite.id));
  });

  return {
    userId,
    organizationSlug: invite.organizationSlug,
  };
}

async function seedOrganizationData(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  organizationId: string,
  inboxId: string,
  now: Date,
) {
  const ticketSeed = [
    {
      id: createId("tkt"),
      externalId: "T-2048",
      company: "Northstar Cloud",
      requesterName: "Amelia Hart",
      requesterEmail: "amelia@northstarcloud.com",
      title: "Duplicate charge after annual plan upgrade",
      body: "We upgraded to the annual enterprise plan and now see two charges. Please confirm which one will be voided.",
      priority: "Critical",
      sentiment: "Frustrated",
      channel: "Email",
      status: "open",
    },
    {
      id: createId("tkt"),
      externalId: "T-2044",
      company: "PulseLayer",
      requesterName: "Rohan Shah",
      requesterEmail: "rohan@pulselayer.io",
      title: "SSO setup blocked by missing Okta metadata",
      body: "Our Okta integration fails during verification and says metadata could not be parsed.",
      priority: "High",
      sentiment: "Urgent",
      channel: "Slack Connect",
      status: "open",
    },
    {
      id: createId("tkt"),
      externalId: "T-2039",
      company: "Branchflow",
      requesterName: "Yana Lopes",
      requesterEmail: "yana@branchflow.com",
      title: "Webhook retries stopped after rotating secret",
      body: "Events stopped replaying after we rotated the webhook secret in the admin panel.",
      priority: "Medium",
      sentiment: "Concerned",
      channel: "Portal",
      status: "investigating",
    },
  ];

  await tx.insert(tickets).values(
    ticketSeed.map((ticket) => ({
      ...ticket,
      organizationId,
      inboxId,
      createdAt: now,
      updatedAt: now,
    })),
  );

  await tx.insert(ticketMessages).values([
    {
      id: createId("msg"),
      ticketId: ticketSeed[0].id,
      authorName: "Amelia Hart",
      authorRole: "Customer",
      body: ticketSeed[0].body,
      createdAt: now,
    },
    {
      id: createId("msg"),
      ticketId: ticketSeed[0].id,
      authorName: "SignalDesk Agent",
      authorRole: "Copilot",
      body: "I found a matching Stripe event sequence. One payment is pending capture and the upgrade invoice is settled. Refund action requires approval.",
      createdAt: new Date(now.getTime() + 60_000),
    },
    {
      id: createId("msg"),
      ticketId: ticketSeed[1].id,
      authorName: "Rohan Shah",
      authorRole: "Customer",
      body: ticketSeed[1].body,
      createdAt: new Date(now.getTime() + 120_000),
    },
  ]);

  await tx.insert(knowledgeDocuments).values([
    {
      id: createId("doc"),
      organizationId,
      title: "Billing policy v4.2",
      body: "Enterprise annual plan upgrades can produce one proration invoice and one pending prior invoice capture. Refunds over $250 require owner approval.",
      source: "policy",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createId("doc"),
      organizationId,
      title: "SSO troubleshooting guide",
      body: "When Okta metadata fails verification, confirm ACS URL, entity ID, certificate formatting, and SHA-256 signing settings.",
      source: "runbook",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createId("doc"),
      organizationId,
      title: "Webhook incident postmortem",
      body: "Secret rotation can invalidate retry signatures if the worker pool has stale config. Force a worker refresh after secret updates.",
      source: "incident",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  const duplicateChargeApprovalId = createId("apr");
  const webhookApprovalId = createId("apr");

  await tx.insert(approvalRequests).values([
    {
      id: duplicateChargeApprovalId,
      organizationId,
      ticketId: ticketSeed[0].id,
      title: "Refund pending capture over threshold",
      description: "If the pending capture settles, refund invoice inv_98234 for the duplicate billing event.",
      status: "pending",
      createdBy: "SignalDesk Agent",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: webhookApprovalId,
      organizationId,
      ticketId: ticketSeed[2].id,
      title: "Rotate webhook worker credentials",
      description: "Apply worker credential refresh in EU region after webhook secret rotation.",
      status: "pending",
      createdBy: "SignalDesk Agent",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  await tx.insert(approvalOperations).values({
    id: createId("apo"),
    approvalRequestId: duplicateChargeApprovalId,
    operationType: "ticket_status_update",
    payload: JSON.stringify({
      ticketStatus: "awaiting-approval",
      message: "Refund approval executed for the duplicate billing workflow.",
      ticketId: ticketSeed[0].id,
    }),
    createdAt: now,
  });

  const runId = createId("run");

  await tx.insert(agentRuns).values({
    id: runId,
    organizationId,
    ticketId: ticketSeed[0].id,
    status: "completed",
    provider: "openai",
    model: "gpt-5.4",
    summary: "Retrieved billing policy, compared invoice state, prepared refund approval, and drafted customer reply.",
    createdAt: now,
    updatedAt: now,
  });

  await tx.insert(agentRunEvents).values([
    {
      id: createId("evt"),
      runId,
      eventType: "retrieve_context",
      detail: "Pulled billing policy, prior duplicate-charge case, and customer metadata.",
      createdAt: now,
    },
    {
      id: createId("evt"),
      runId,
      eventType: "mcp.stripe.get_payment_intents",
      detail: "Compared latest invoice, upgrade proration, and capture state for the customer account.",
      createdAt: new Date(now.getTime() + 30_000),
    },
    {
      id: createId("evt"),
      runId,
      eventType: "draft_customer_reply",
      detail: "Prepared a grounded reply with invoice IDs and the next billing check.",
      createdAt: new Date(now.getTime() + 60_000),
    },
  ]);

  await tx.insert(integrations).values([
    {
      id: createId("int"),
      organizationId,
      provider: "stripe",
      label: "Production billing",
      status: "active",
      config: JSON.stringify({ scope: "billing:read" }),
      createdAt: now,
    },
    {
      id: createId("int"),
      organizationId,
      provider: "slack",
      label: "Support escalation workspace",
      status: "active",
      config: JSON.stringify({ channels: ["#support-escalations"] }),
      createdAt: now,
    },
    {
      id: createId("int"),
      organizationId,
      provider: "mcp-local",
      label: "sandbox_everything",
      status: "active",
      config: JSON.stringify({
        type: "local",
        command: ["bun", "x", "mcp-server-everything"],
      }),
      createdAt: now,
    },
  ]);
}

async function createUniqueOrganizationSlug(baseSlug: string) {
  const matches = await db
    .select({ slug: organizations.slug })
    .from(organizations)
    .where(like(organizations.slug, `${baseSlug}%`));

  const taken = new Set(matches.map((match) => match.slug));

  if (!taken.has(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  while (taken.has(`${baseSlug}-${counter}`)) {
    counter += 1;
  }

  return `${baseSlug}-${counter}`;
}

export async function getOrganizationBySlugForUser(userId: string, orgSlug: string) {
  await ensureDatabase();

  const [result] = await db
    .select({
      organizationId: organizations.id,
      organizationName: organizations.name,
      organizationSlug: organizations.slug,
      role: memberships.role,
    })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.organizationId, organizations.id))
    .where(and(eq(memberships.userId, userId), eq(organizations.slug, orgSlug)))
    .limit(1);

  return result ?? null;
}
