import { and, desc, eq } from "drizzle-orm";
import { db, ensureDatabase } from "@/lib/db";
import {
  agentRunEvents,
  agentRuns,
  approvalRequests,
  integrations,
  knowledgeDocuments,
  tickets,
  ticketMessages,
} from "@/lib/db/schema";

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}

export async function listTicketsForOrganization(organizationId: string) {
  await ensureDatabase();

  return db
    .select()
    .from(tickets)
    .where(eq(tickets.organizationId, organizationId))
    .orderBy(desc(tickets.updatedAt));
}

export async function getTicketDetail(organizationId: string, ticketId: string) {
  await ensureDatabase();

  const [ticket] = await db
    .select()
    .from(tickets)
    .where(and(eq(tickets.organizationId, organizationId), eq(tickets.id, ticketId)))
    .limit(1);

  if (!ticket) {
    return null;
  }

  const [messages, runs] = await Promise.all([
    db.select().from(ticketMessages).where(eq(ticketMessages.ticketId, ticketId)).orderBy(ticketMessages.createdAt),
    db.select().from(agentRuns).where(eq(agentRuns.ticketId, ticketId)).orderBy(desc(agentRuns.createdAt)),
  ]);

  const runIds = runs.map((run) => run.id);
  const events = runIds.length
    ? await db.select().from(agentRunEvents).where(eq(agentRunEvents.runId, runIds[0])).orderBy(agentRunEvents.createdAt)
    : [];

  return {
    ticket,
    messages,
    runs,
    events,
  };
}

export async function listKnowledgeDocuments(organizationId: string) {
  await ensureDatabase();
  return db.select().from(knowledgeDocuments).where(eq(knowledgeDocuments.organizationId, organizationId)).orderBy(desc(knowledgeDocuments.updatedAt));
}

export async function listApprovalRequests(organizationId: string) {
  await ensureDatabase();
  return db.select().from(approvalRequests).where(eq(approvalRequests.organizationId, organizationId)).orderBy(desc(approvalRequests.updatedAt));
}

export async function listIntegrations(organizationId: string) {
  await ensureDatabase();
  return db.select().from(integrations).where(eq(integrations.organizationId, organizationId)).orderBy(desc(integrations.createdAt));
}

export async function listAgentRuns(organizationId: string) {
  await ensureDatabase();
  return db.select().from(agentRuns).where(eq(agentRuns.organizationId, organizationId)).orderBy(desc(agentRuns.updatedAt));
}

export async function addKnowledgeDocument(input: {
  organizationId: string;
  title: string;
  body: string;
  source: string;
}) {
  await ensureDatabase();
  const now = new Date();

  await db.insert(knowledgeDocuments).values({
    id: createId("doc"),
    organizationId: input.organizationId,
    title: input.title,
    body: input.body,
    source: input.source,
    createdAt: now,
    updatedAt: now,
  });
}

export async function addTicketReply(input: {
  ticketId: string;
  authorName: string;
  body: string;
}) {
  await ensureDatabase();
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx.insert(ticketMessages).values({
      id: createId("msg"),
      ticketId: input.ticketId,
      authorName: input.authorName,
      authorRole: "Support",
      body: input.body,
      createdAt: now,
    });

    await tx.update(tickets).set({ updatedAt: now, status: "pending-customer" }).where(eq(tickets.id, input.ticketId));
  });
}

export async function updateApprovalRequestStatus(input: {
  approvalId: string;
  organizationId: string;
  status: "approved" | "denied";
}) {
  await ensureDatabase();

  await db
    .update(approvalRequests)
    .set({ status: input.status, updatedAt: new Date() })
    .where(and(eq(approvalRequests.id, input.approvalId), eq(approvalRequests.organizationId, input.organizationId)));
}

export async function addIntegration(input: {
  organizationId: string;
  provider: string;
  label: string;
  config: string;
}) {
  await ensureDatabase();

  await db.insert(integrations).values({
    id: createId("int"),
    organizationId: input.organizationId,
    provider: input.provider,
    label: input.label,
    config: input.config,
    status: "active",
    createdAt: new Date(),
  });
}

export async function createAgentRunRecord(input: {
  organizationId: string;
  ticketId: string;
  provider: string;
  model: string;
  summary: string;
}) {
  await ensureDatabase();
  const id = createId("run");
  const now = new Date();

  await db.insert(agentRuns).values({
    id,
    organizationId: input.organizationId,
    ticketId: input.ticketId,
    provider: input.provider,
    model: input.model,
    status: "running",
    summary: input.summary,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function updateAgentRunRecord(input: {
  runId: string;
  status: string;
  summary: string;
}) {
  await ensureDatabase();
  await db.update(agentRuns).set({ status: input.status, summary: input.summary, updatedAt: new Date() }).where(eq(agentRuns.id, input.runId));
}

export async function appendAgentRunEvent(input: {
  runId: string;
  eventType: string;
  detail: string;
}) {
  await ensureDatabase();
  await db.insert(agentRunEvents).values({
    id: createId("evt"),
    runId: input.runId,
    eventType: input.eventType,
    detail: input.detail,
    createdAt: new Date(),
  });
}

export async function addCopilotMessage(input: {
  ticketId: string;
  body: string;
}) {
  await ensureDatabase();
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx.insert(ticketMessages).values({
      id: createId("msg"),
      ticketId: input.ticketId,
      authorName: "SignalDesk Agent",
      authorRole: "Copilot",
      body: input.body,
      createdAt: now,
    });

    await tx.update(tickets).set({ updatedAt: now }).where(eq(tickets.id, input.ticketId));
  });
}

export async function createApprovalRequest(input: {
  organizationId: string;
  ticketId: string;
  title: string;
  description: string;
  createdBy: string;
}) {
  await ensureDatabase();
  const now = new Date();

  await db.insert(approvalRequests).values({
    id: createId("apr"),
    organizationId: input.organizationId,
    ticketId: input.ticketId,
    title: input.title,
    description: input.description,
    status: "pending",
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  });
}
