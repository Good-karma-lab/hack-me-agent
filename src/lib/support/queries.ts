import { and, desc, eq } from "drizzle-orm";
import { db, ensureDatabase } from "@/lib/db";
import {
  agentRunEvents,
  agentRuns,
  approvalOperations,
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
  const approvals = await db.select().from(approvalRequests).where(eq(approvalRequests.organizationId, organizationId)).orderBy(desc(approvalRequests.updatedAt));

  const operations = await Promise.all(
    approvals.map((approval) => db.select().from(approvalOperations).where(eq(approvalOperations.approvalRequestId, approval.id)).limit(1)),
  );

  return approvals.map((approval, index) => ({
    ...approval,
    operation: operations[index]?.[0] ?? null,
  }));
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
  status?: string;
}) {
  await ensureDatabase();

  await db.insert(integrations).values({
    id: createId("int"),
    organizationId: input.organizationId,
    provider: input.provider,
    label: input.label,
    config: input.config,
    status: input.status ?? "active",
    createdAt: new Date(),
  });
}

export async function updateIntegrationStatus(input: {
  integrationId: string;
  organizationId: string;
  status: "active" | "inactive";
}) {
  await ensureDatabase();

  await db
    .update(integrations)
    .set({ status: input.status })
    .where(and(eq(integrations.id, input.integrationId), eq(integrations.organizationId, input.organizationId)));
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
  provider?: string;
  model?: string;
}) {
  await ensureDatabase();
  await db
    .update(agentRuns)
    .set({
      status: input.status,
      summary: input.summary,
      provider: input.provider,
      model: input.model,
      updatedAt: new Date(),
    })
    .where(eq(agentRuns.id, input.runId));
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

export async function addAssistantPromptMessage(input: {
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
      authorRole: "Teammate",
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
  operationType?: string;
  operationPayload?: string;
}) {
  await ensureDatabase();
  const now = new Date();
  const approvalId = createId("apr");

  await db.transaction(async (tx) => {
    await tx.insert(approvalRequests).values({
      id: approvalId,
      organizationId: input.organizationId,
      ticketId: input.ticketId,
      title: input.title,
      description: input.description,
      status: "pending",
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    });

    if (input.operationType && input.operationPayload) {
      await tx.insert(approvalOperations).values({
        id: createId("apo"),
        approvalRequestId: approvalId,
        operationType: input.operationType,
        payload: input.operationPayload,
        createdAt: now,
      });
    }
  });

  return approvalId;
}

export async function executeApprovalRequest(input: {
  approvalId: string;
  organizationId: string;
  actorName: string;
}) {
  await ensureDatabase();

  const [approval] = await db
    .select()
    .from(approvalRequests)
    .where(and(eq(approvalRequests.id, input.approvalId), eq(approvalRequests.organizationId, input.organizationId)))
    .limit(1);

  if (!approval || approval.status !== "approved") {
    return;
  }

  const [operation] = await db
    .select()
    .from(approvalOperations)
    .where(eq(approvalOperations.approvalRequestId, input.approvalId))
    .limit(1);

  if (!operation || operation.executedAt) {
    return;
  }

  const payload = JSON.parse(operation.payload) as { ticketStatus?: string; message?: string; ticketId?: string };
  const now = new Date();

  await db.transaction(async (tx) => {
    if (operation.operationType === "ticket_status_update" && approval.ticketId && payload.ticketStatus) {
      await tx.update(tickets).set({ status: payload.ticketStatus, updatedAt: now }).where(eq(tickets.id, approval.ticketId));
    }

    if (approval.ticketId && payload.message) {
      await tx.insert(ticketMessages).values({
        id: createId("msg"),
        ticketId: approval.ticketId,
        authorName: input.actorName,
        authorRole: "Approver",
        body: payload.message,
        createdAt: now,
      });
    }

    await tx
      .update(approvalOperations)
      .set({ executedAt: now, executedBy: input.actorName })
      .where(eq(approvalOperations.id, operation.id));
  });
}
