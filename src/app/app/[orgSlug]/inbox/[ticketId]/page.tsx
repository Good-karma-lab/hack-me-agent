import Link from "next/link";
import { CheckCircle2, Clock3, LifeBuoy, MessagesSquare, Sparkles } from "lucide-react";
import { ChatMessage } from "@/components/app/chat-message";
import { PageHeader } from "@/components/app/page-header";
import { CopilotRunButton } from "@/components/app/copilot-run-button";
import { RunLiveRefresh } from "@/components/app/run-live-refresh";
import { addTicketReplyAction, runTicketCopilotAction } from "@/app/app/actions";
import { requireOrganizationAccess } from "@/lib/auth/session";
import { getTicketDetail, listTicketsForOrganization } from "@/lib/support/queries";
import { cn } from "@/lib/utils";

type TicketDetailPageProps = {
  params: Promise<{ orgSlug: string; ticketId: string }>;
  searchParams: Promise<{ copilot?: string }>;
};

export default async function TicketDetailPage({ params, searchParams }: TicketDetailPageProps) {
  const { orgSlug, ticketId } = await params;
  const query = await searchParams;
  const { organization } = await requireOrganizationAccess(orgSlug);
  const [allTickets, detail] = await Promise.all([
    listTicketsForOrganization(organization.id),
    getTicketDetail(organization.id, ticketId),
  ]);

  if (!detail) {
    return null;
  }

  const { ticket, messages, runs, events } = detail;
  const latestRun = runs[0] ?? null;
  const isRunning = latestRun?.status === "running";
  const hasStartedNotice = query.copilot === "started";
  const customerMessages = messages.filter((entry) => entry.authorRole === "Customer" || entry.authorRole === "Support");
  const assistantMessages = messages.filter((entry) => entry.authorRole === "Teammate" || entry.authorRole === "Copilot" || entry.authorRole === "Approver");
  const latestAssistantMessageId = [...assistantMessages].reverse().find((entry) => entry.authorRole === "Copilot")?.id;
  const activityItems = events.map((event) => {
    if (event.eventType === "response.generated") {
      return "Prepared a recommended next step for the team.";
    }

    if (event.eventType === "approval.requested") {
      return `Flagged an action for approval: ${event.detail}`;
    }

    if (event.eventType === "context.loaded") {
      return "Reviewed the ticket history and workspace knowledge before answering.";
    }

    if (event.eventType === "session.error") {
      return `Hit a problem while preparing the update: ${event.detail}`;
    }

    return null;
  }).filter(Boolean) as string[];

  return (
    <section className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_380px]">
      <RunLiveRefresh active={isRunning} />
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.9),rgba(7,12,24,0.92))] p-4 shadow-[0_24px_60px_rgba(2,6,18,0.35)]">
        <PageHeader
          eyebrow="Priority queue"
          title="Incoming conversations"
          description="Real tenant-backed tickets ordered by urgency and last activity."
          action={<div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{allTickets.length} open</div>}
        />
        <div className="mt-5 space-y-3">
          {allTickets.map((item) => (
            <Link
              key={item.id}
              href={`/app/${orgSlug}/inbox/${item.id}`}
              data-testid={`ticket-link-${item.id}`}
              className={cn(
                "block rounded-[24px] border p-4 transition",
                item.id === ticket.id ? "border-cyan-300/30 bg-cyan-300/10" : "border-white/10 bg-white/5 hover:bg-white/[0.07]",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span>{item.externalId}</span>
                    <span className="text-slate-500">•</span>
                    <span>{item.company}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-white">{item.title}</h3>
                  <p className="mt-2 text-xs text-slate-400">{item.requesterName} via {item.channel}</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <div>{item.status}</div>
                  <div className="mt-2 rounded-full bg-white/8 px-2 py-1 text-[11px] text-white">{item.priority}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,22,39,0.9),rgba(8,12,23,0.96))] p-5 shadow-[0_24px_60px_rgba(2,6,18,0.35)]">
        <PageHeader
          eyebrow="Customer conversation"
          title={ticket.title}
          description={`${ticket.company} • ${ticket.requesterName} • ${ticket.sentiment}`}
          action={
            <div className="flex items-center gap-3">
              <div data-testid="ticket-status" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
                {ticket.status}
              </div>
                <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                {isRunning ? "Assistant is working" : latestRun ? "Assistant update available" : "No assistant update yet"}
              </div>
            </div>
          }
        />

        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          This is the customer-facing thread. Use the panel on the right to ask the assistant for a summary, a draft reply, or the next step.
        </div>

        <div className="mt-6 space-y-4">
          {customerMessages.map((entry) => (
            <article key={entry.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-white">{entry.authorName}</h3>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{entry.authorRole}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock3 className="h-3.5 w-3.5" />
                  {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(entry.createdAt)}
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-200">{entry.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-[28px] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(125,211,252,0.16),rgba(59,130,246,0.06))] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-100">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Reply to customer</p>
              <p className="text-xs text-cyan-100/70">This writes a real message into the tenant ticket timeline.</p>
            </div>
          </div>
          <form action={addTicketReplyAction} className="mt-4 space-y-3">
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <input type="hidden" name="ticketId" value={ticket.id} />
            <textarea
              required
              data-testid="reply-body"
              name="body"
              rows={5}
              placeholder="Draft a grounded support response or internal note"
              className="w-full rounded-[20px] border border-white/10 bg-[#07111d] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
            <button data-testid="reply-submit" className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-50">
              Add reply
            </button>
          </form>
        </div>
      </div>

      <aside className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,17,30,0.94),rgba(8,12,22,0.98))] p-4 shadow-[0_24px_60px_rgba(2,6,18,0.35)]">
        <PageHeader
          eyebrow="Assistant"
          title="Chat with the assistant"
          description="Ask questions, request a draft reply, or get help deciding what to do next."
        />
        <div className="mt-5 rounded-[24px] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(125,211,252,0.14),rgba(59,130,246,0.05))] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-medium text-white">Assistant chat</h3>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                Type naturally, like you would in ChatGPT. The assistant will answer in this conversation.
              </p>
              {hasStartedNotice ? (
                <div className="mt-4 rounded-[18px] border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
                  The assistant started working. This panel will refresh automatically while the answer is being prepared.
                </div>
              ) : null}
            </div>
          </div>
          <form action={runTicketCopilotAction} className="mt-5 space-y-3">
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <input type="hidden" name="ticketId" value={ticket.id} />
            <textarea
              name="userPrompt"
              data-testid="agent-prompt"
              rows={4}
              placeholder="Ask anything about this ticket..."
              className="w-full rounded-[20px] border border-white/10 bg-[#07111d] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
            <div className="flex items-center justify-between gap-3">
              <CopilotRunButton idleLabel="Send to assistant" pendingLabel="Sending..." />
              <span data-testid="run-status-detail" className="rounded-full bg-white/8 px-2.5 py-1 text-xs text-white">
                {isRunning ? "working" : latestRun ? "ready" : "idle"}
              </span>
            </div>
          </form>
        </div>

        <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-400/15 text-fuchsia-200">
              <MessagesSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Assistant conversation</p>
              <p className="text-xs text-slate-400">Your requests and the assistant replies live here.</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {assistantMessages.length ? assistantMessages.map((entry) => (
              <article
                key={entry.id}
                data-testid={entry.authorRole === "Copilot" ? "assistant-reply" : undefined}
                className={cn(
                  "rounded-[20px] border p-3",
                  entry.authorRole === "Teammate"
                    ? "border-cyan-300/20 bg-cyan-300/10"
                    : entry.authorRole === "Approver"
                      ? "border-amber-300/20 bg-amber-300/10"
                      : "border-white/10 bg-black/20",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium text-white">
                    {entry.authorRole === "Teammate"
                      ? `${entry.authorName} to assistant`
                      : entry.authorRole === "Approver"
                        ? `${entry.authorName} approved an action`
                        : "Assistant"}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(entry.createdAt)}
                  </span>
                </div>
                <div className="mt-2">
                  <ChatMessage body={entry.body} animate={entry.authorRole === "Copilot" && entry.id === latestAssistantMessageId} />
                </div>
              </article>
            )) : (
              <div className="rounded-[20px] border border-dashed border-white/10 bg-black/10 p-4 text-sm leading-7 text-slate-400">
                No assistant conversation yet. Ask for a summary, a reply draft, or help deciding the next step.
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-medium text-white">What the assistant did</p>
          <div className="mt-4 space-y-3">
            {activityItems.length ? activityItems.map((item) => (
              <article key={item} className="rounded-[20px] border border-white/10 bg-black/20 p-3 text-sm leading-7 text-slate-300">
                {item}
              </article>
            )) : (
              <div className="rounded-[20px] border border-dashed border-white/10 bg-black/10 p-4 text-sm leading-7 text-slate-400">
                No assistant activity yet for this ticket.
              </div>
            )}
          </div>
        </div>
      </aside>
    </section>
  );
}
