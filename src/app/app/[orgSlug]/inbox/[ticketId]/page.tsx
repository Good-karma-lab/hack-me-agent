import Link from "next/link";
import { CheckCircle2, Clock3, Command, LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { addTicketReplyAction, runTicketCopilotAction } from "@/app/app/actions";
import { requireOrganizationAccess } from "@/lib/auth/session";
import { getTicketDetail, listTicketsForOrganization } from "@/lib/support/queries";
import { cn } from "@/lib/utils";

type TicketDetailPageProps = {
  params: Promise<{ orgSlug: string; ticketId: string }>;
};

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { orgSlug, ticketId } = await params;
  const { organization } = await requireOrganizationAccess(orgSlug);
  const [allTickets, detail] = await Promise.all([
    listTicketsForOrganization(organization.id),
    getTicketDetail(organization.id, ticketId),
  ]);

  if (!detail) {
    return null;
  }

  const { ticket, messages, runs, events } = detail;

  return (
    <section className="grid gap-4 xl:grid-cols-[0.9fr_1.05fr_340px]">
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
              <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                {runs[0] ? "AI run available" : "No run yet"}
              </div>
              <form action={runTicketCopilotAction}>
                <input type="hidden" name="orgSlug" value={orgSlug} />
                <input type="hidden" name="ticketId" value={ticket.id} />
                <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-50">
                  <span data-testid="run-copilot-label">Run copilot</span>
                  Run copilot
                </button>
              </form>
            </div>
          }
        />

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
          eyebrow="Run trace"
          title={runs[0]?.id ?? "No run yet"}
          description={runs[0]?.summary ?? "Agent execution will be wired to the OpenCode SDK in the next milestone."}
        />
        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-400/15 text-fuchsia-200">
              <Command className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Model</p>
              <p className="text-xs text-slate-400">{runs[0] ? `${runs[0].provider}/${runs[0].model}` : "pending"}</p>
            </div>
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
