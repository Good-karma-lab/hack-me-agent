import { and, eq, like } from "drizzle-orm";
import { db, ensureDatabase } from "@/lib/db";
import { inboxes, memberships, organizations, users } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "./password";
import { slugify } from "@/lib/utils";

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
  });

  return {
    userId,
    organizationSlug: slug,
  };
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
