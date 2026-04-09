import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, ensureDatabase } from "@/lib/db";
import { memberships, organizations, sessions, users } from "@/lib/db/schema";

const SESSION_COOKIE_NAME = "signaldesk_session";
const THIRTY_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 30;

type SessionOrganization = {
  id: string;
  slug: string;
  name: string;
  role: string;
};

export type AuthSession = {
  user: {
    id: string;
    email: string;
    name: string;
  };
  organizations: SessionOrganization[];
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  await ensureDatabase();

  const token = randomBytes(24).toString("hex");
  const sessionId = hashToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + THIRTY_DAYS_IN_MS);

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    createdAt: now,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await ensureDatabase();
    await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession() {
  await ensureDatabase();

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const sessionId = hashToken(token);

  const rows = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      orgId: organizations.id,
      orgName: organizations.name,
      orgSlug: organizations.slug,
      role: memberships.role,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .leftJoin(memberships, eq(memberships.userId, users.id))
    .leftJoin(organizations, eq(memberships.organizationId, organizations.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())));

  if (rows.length === 0) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  const [firstRow] = rows;
  const organizationMap = new Map<string, SessionOrganization>();

  for (const row of rows) {
    if (row.orgId && row.orgSlug && row.orgName && row.role) {
      organizationMap.set(row.orgId, {
        id: row.orgId,
        slug: row.orgSlug,
        name: row.orgName,
        role: row.role,
      });
    }
  }

  return {
    user: {
      id: firstRow.userId,
      email: firstRow.email,
      name: firstRow.name,
    },
    organizations: [...organizationMap.values()],
  } satisfies AuthSession;
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireOrganizationAccess(orgSlug: string) {
  const session = await requireSession();
  const membership = session.organizations.find((organization) => organization.slug === orgSlug);

  if (!membership) {
    if (session.organizations[0]) {
      redirect(`/app/${session.organizations[0].slug}/inbox`);
    }

    redirect("/onboarding");
  }

  return {
    session,
    organization: membership,
  };
}
