import Link from "next/link";
import { CheckCircle2, Clock3, Command, LifeBuoy, Sparkles } from "lucide-react";
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

  return (
    <section className="grid gap-4 xl:grid-cols-[0.9fr_1.05fr_340px]">
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
          eyebrow="Live ticket"
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

        <div className="mt-6 rounded-[28px] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(125,211,252,0.14),rgba(59,130,246,0.05))] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-medium text-white">Investigate with AI</h3>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                Ask the assistant what you want done on this ticket. It reviews the conversation and your workspace context, then posts an internal note, drafts a reply, and asks for approval when an action needs sign-off.
              </p>
              {hasStartedNotice ? (
                <div className="mt-4 rounded-[18px] border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
                  The assistant started working. This page will refresh automatically while the update is in progress.
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Understands the conversation</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Uses connected workspace data</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Requests approval when needed</span>
              </div>
            </div>
          </div>
          <form action={runTicketCopilotAction} className="mt-5 space-y-3">
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <input type="hidden" name="ticketId" value={ticket.id} />
            <label className="block">
              <span className="text-sm font-medium text-white">Ask the agent</span>
              <textarea
                name="userPrompt"
                data-testid="agent-prompt"
                rows={4}
                placeholder="Examples: Summarize the issue. Draft a reply. Tell me what needs approval."
                className="mt-2 w-full rounded-[20px] border border-white/10 bg-[#07111d] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <CopilotRunButton idleLabel="Ask assistant" pendingLabel="Starting assistant update..." />
              <p className="text-sm text-slate-300">
                {isRunning ? "The assistant is working now. New notes will appear here automatically." : latestRun ? "The latest assistant update is shown in the right panel and in the conversation." : "No assistant work has been run for this ticket yet."}
              </p>
            </div>
          </form>
        </div>

        <div className="mt-6 space-y-4">
          {messages.map((entry) => (
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
          eyebrow="Assistant Activity"
          title={latestRun ? "Latest assistant update" : "No update yet"}
          description={latestRun?.summary ?? "Ask the assistant to review the ticket and prepare the next step."}
        />
        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-400/15 text-fuchsia-200">
              <Command className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Update source</p>
              <p data-testid="run-model" className="text-xs text-slate-400">{latestRun ? "Assistant generated an update for this ticket" : "No update yet"}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-[18px] border border-white/10 bg-[#07111d] px-3 py-2.5 text-sm text-slate-200">
            <span>Progress</span>
            <span data-testid="run-status-detail" className="rounded-full bg-white/8 px-2.5 py-1 text-xs text-white">
              {latestRun?.status ?? "idle"}
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="space-y-3">
            {events.map((event) => (
              <article key={event.id} className="rounded-[20px] border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium text-white">{event.eventType}</h3>
                  <span className="rounded-full bg-white/8 px-2 py-1 text-[11px] text-slate-200">recorded</span>
                </div>
                <p className="mt-2 text-xs leading-6 text-slate-400">{event.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}
