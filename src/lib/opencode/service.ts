import { createOpencode } from "@opencode-ai/sdk";
import {
  addCopilotMessage,
  appendAgentRunEvent,
  createAgentRunRecord,
  createApprovalRequest,
  getTicketDetail,
  listApprovalRequests,
  listIntegrations,
  listKnowledgeDocuments,
  updateAgentRunRecord,
} from "@/lib/support/queries";

type LocalMcpConfig = {
  type: "local";
  command: string[];
  enabled?: boolean;
  environment?: Record<string, string>;
};

type RemoteMcpConfig = {
  type: "remote";
  url: string;
  enabled?: boolean;
  headers?: Record<string, string>;
  oauth?: false;
};

type OpencodeConfig = {
  model?: string;
  mcp?: Record<string, LocalMcpConfig | RemoteMcpConfig>;
  tools?: Record<string, boolean>;
  instructions?: string[];
};

type RunTicketCopilotInput = {
  organizationId: string;
  ticketId: string;
};

type StructuredRunResult = {
  summary: string;
  customerReply: string;
  internalNote: string;
  needsApproval: boolean;
  approvalTitle?: string;
  approvalReason?: string;
  usedMcpTools?: string[];
  approvalOperation?: {
    type: "ticket_status_update";
    ticketStatus: string;
    message: string;
  };
};

const OPENCODE_MODEL = process.env.OPENCODE_MODEL;

const globalState = globalThis as typeof globalThis & {
  signalDeskOpencode?: {
    signature: string;
    instance: Promise<Awaited<ReturnType<typeof createOpencode>>>;
  };
};

function parseModel(model: string | undefined) {
  if (!model || !model.includes("/")) {
    return null;
  }

  const [providerID, modelID] = model.split("/");

  if (!providerID || !modelID) {
    return null;
  }

  return { providerID, modelID };
}

function buildMcpConfig(integrations: Awaited<ReturnType<typeof listIntegrations>>): OpencodeConfig["mcp"] {
  const entries: Array<[string, LocalMcpConfig | RemoteMcpConfig]> = [];

  for (const integration of integrations.filter((item) => item.status === "active")) {
    try {
      const parsed = JSON.parse(integration.config) as Record<string, unknown>;
      if (parsed.type === "local" && Array.isArray(parsed.command)) {
        entries.push([
          integration.label.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
          {
            type: "local",
            command: parsed.command as string[],
            enabled: true,
            environment: typeof parsed.environment === "object" && parsed.environment ? (parsed.environment as Record<string, string>) : undefined,
          },
        ]);
      }

      if (parsed.type === "remote" && typeof parsed.url === "string") {
        entries.push([
          integration.label.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
          {
            type: "remote",
            url: parsed.url,
            enabled: true,
            headers: typeof parsed.headers === "object" && parsed.headers ? (parsed.headers as Record<string, string>) : undefined,
            oauth: parsed.oauth === false ? false : undefined,
          },
        ]);
      }
    } catch {
      continue;
    }
  }

  return Object.fromEntries(entries);
}

async function getOpencodeForIntegrations(integrations: Awaited<ReturnType<typeof listIntegrations>>) {
  const config: OpencodeConfig = {
    model: OPENCODE_MODEL,
    mcp: buildMcpConfig(integrations),
    tools: {},
    instructions: ["AGENTS.md"],
  };

  const signature = JSON.stringify(config);

  if (!globalState.signalDeskOpencode || globalState.signalDeskOpencode.signature !== signature) {
    const previous = globalState.signalDeskOpencode;
    if (previous) {
      void previous.instance.then((instance) => instance.server.close()).catch(() => undefined);
    }

    globalState.signalDeskOpencode = {
      signature,
      instance: createOpencode({
        port: 0,
        config,
      }),
    };
  }

  return globalState.signalDeskOpencode.instance;
}

async function createSession(serverUrl: string, title: string) {
  const response = await fetch(`${serverUrl}/session`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Unable to create OpenCode session (${response.status}): ${body}`);
  }

  return (await response.json()) as { id: string };
}

async function promptSession(
  serverUrl: string,
  sessionId: string,
  body: Record<string, unknown>,
) {
  const response = await fetch(`${serverUrl}/session/${sessionId}/message`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenCode prompt failed (${response.status}): ${body}`);
  }

  return (await response.json()) as {
    info: {
      structured?: unknown;
      providerID?: string;
      modelID?: string;
    };
  };
}

export async function runTicketCopilot(input: RunTicketCopilotInput) {
  const [ticketDetail] = await Promise.all([
    getTicketDetail(input.organizationId, input.ticketId),
  ]);

  if (!ticketDetail) {
    throw new Error("Ticket not found.");
  }

  const parsedModel = parseModel(OPENCODE_MODEL);
  const runId = await createAgentRunRecord({
    organizationId: input.organizationId,
    ticketId: input.ticketId,
    provider: parsedModel?.providerID ?? "pending",
    model: parsedModel?.modelID ?? "pending",
    summary: "Queued AI investigation for this ticket.",
  });

  void processTicketCopilot({
    ...input,
    runId,
  });

  return runId;
}

async function processTicketCopilot(input: RunTicketCopilotInput & { runId: string }) {
  const [ticketDetail, documents, integrations, approvals] = await Promise.all([
    getTicketDetail(input.organizationId, input.ticketId),
    listKnowledgeDocuments(input.organizationId),
    listIntegrations(input.organizationId),
    listApprovalRequests(input.organizationId),
  ]);

  if (!ticketDetail) {
    throw new Error("Ticket not found.");
  }

  const parsedModel = parseModel(OPENCODE_MODEL);
  const runId = input.runId;

  await updateAgentRunRecord({
    runId,
    status: "running",
    summary: "Starting OpenCode support analysis.",
    provider: parsedModel?.providerID ?? "pending",
    model: parsedModel?.modelID ?? "pending",
  });

  try {
    const opencode = await getOpencodeForIntegrations(integrations);
    const session = await createSession(opencode.server.url, `Support: ${ticketDetail.ticket.title}`);

    await appendAgentRunEvent({
      runId,
      eventType: "session.create",
      detail: `Created OpenCode session ${session.id}`,
    });

    const contextParts = [
      `Ticket title: ${ticketDetail.ticket.title}`,
      `Customer: ${ticketDetail.ticket.requesterName} <${ticketDetail.ticket.requesterEmail}>`,
      `Priority: ${ticketDetail.ticket.priority}`,
      `Sentiment: ${ticketDetail.ticket.sentiment}`,
      `Ticket body: ${ticketDetail.ticket.body}`,
      `Conversation so far:\n${ticketDetail.messages.map((message) => `${message.authorRole} ${message.authorName}: ${message.body}`).join("\n\n")}`,
      `Knowledge documents:\n${documents.map((document) => `- ${document.title} [${document.source}]: ${document.body}`).join("\n")}`,
      `Existing approvals:\n${approvals.map((approval) => `- ${approval.title}: ${approval.status}`).join("\n") || "None"}`,
      `Available integrations:\n${integrations.map((integration) => `- ${integration.label} (${integration.provider})`).join("\n") || "None"}`,
      "If a relevant MCP server is available, use it explicitly and report which MCP tools you used.",
      "Prefer tenant-scoped sources. Do not invent external facts.",
    ].join("\n\n");

    await promptSession(opencode.server.url, session.id, {
      noReply: true,
      parts: [{ type: "text", text: contextParts }],
    });

    await appendAgentRunEvent({
      runId,
      eventType: "context.loaded",
      detail: `Loaded ${documents.length} docs, ${integrations.length} integrations, and ${ticketDetail.messages.length} messages into session context.`,
    });

    const response = await promptSession(opencode.server.url, session.id, {
      model: parsedModel ?? undefined,
      system:
        "You are a support copilot for a multi-tenant SaaS. Produce grounded support output only. Use MCP tools when useful and available. Return structured JSON matching the schema.",
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            summary: { type: "string" },
            customerReply: { type: "string" },
            internalNote: { type: "string" },
            needsApproval: { type: "boolean" },
            approvalTitle: { type: "string" },
            approvalReason: { type: "string" },
            usedMcpTools: {
              type: "array",
              items: { type: "string" },
            },
            approvalOperation: {
              type: "object",
              additionalProperties: false,
              properties: {
                type: { type: "string" },
                ticketStatus: { type: "string", enum: ["awaiting-approval"] },
                message: { type: "string" },
              },
              required: ["type", "ticketStatus", "message"],
            },
          },
          required: ["summary", "customerReply", "internalNote", "needsApproval"],
        },
      },
      parts: [
        {
          type: "text",
          text: "Investigate this support ticket, summarize the issue, draft a customer-safe response, and say whether a human approval is required before any action. If approval is needed, include an approvalOperation with type `ticket_status_update`, ticketStatus `awaiting-approval`, and a human-readable approval message.",
        },
      ],
    });

    const structured = response.info.structured as StructuredRunResult | undefined;

    if (!structured) {
      throw new Error("OpenCode did not return structured output.");
    }

    await appendAgentRunEvent({
      runId,
      eventType: "response.generated",
      detail: structured.summary,
    });

    if (structured.usedMcpTools?.length) {
      await appendAgentRunEvent({
        runId,
        eventType: "mcp.tools.used",
        detail: structured.usedMcpTools.join(", "),
      });
    }

    await addCopilotMessage({
      ticketId: input.ticketId,
      body: `${structured.internalNote}\n\nSuggested customer reply:\n${structured.customerReply}`,
    });

    if (structured.needsApproval && structured.approvalTitle && structured.approvalReason) {
      await createApprovalRequest({
        organizationId: input.organizationId,
        ticketId: input.ticketId,
        title: structured.approvalTitle,
        description: structured.approvalReason,
        createdBy: "SignalDesk Agent",
        operationType: structured.approvalOperation?.type,
        operationPayload: structured.approvalOperation
          ? JSON.stringify({
            ticketStatus: structured.approvalOperation.ticketStatus,
            message: structured.approvalOperation.message,
            ticketId: input.ticketId,
          })
          : undefined,
      });

      await appendAgentRunEvent({
        runId,
        eventType: "approval.requested",
        detail: structured.approvalTitle,
      });
    }

    await updateAgentRunRecord({
      runId,
      status: "completed",
      summary: structured.summary,
      provider: response.info.providerID,
      model: response.info.modelID,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown OpenCode failure.";

    await appendAgentRunEvent({
      runId,
      eventType: "session.error",
      detail: message,
    });

    await updateAgentRunRecord({
      runId,
      status: "failed",
      summary: message,
    });

    throw error;
  }
}
