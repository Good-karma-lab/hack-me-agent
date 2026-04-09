import { ArrowRight, CheckCircle2, Clock3, Command, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { agentActions, tickets, timeline } from "@/lib/site-data";

export default function InboxPage() {
  const activeTicket = tickets[0];

  return (
    <section className="grid gap-4 xl:grid-cols-[0.92fr_1.1fr_340px]">
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.9),rgba(7,12,24,0.92))] p-4 shadow-[0_24px_60px_rgba(2,6,18,0.35)]">
        <PageHeader
          eyebrow="Priority queue"
          title="Incoming conversations"
          description="Your highest-signal issues, ready for triage or handoff to the OpenCode-powered copilot runtime."
          action={<div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">18 open</div>}
        />
        <div className="mt-5 space-y-3">
          {tickets.map((ticket, index) => (
            <article
              key={ticket.id}
              className={`rounded-[24px] border p-4 transition ${
                index === 0 ? "border-cyan-300/30 bg-cyan-300/10" : "border-white/10 bg-white/5 hover:bg-white/[0.07]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span>{ticket.id}</span>
                    <span className="text-slate-500">•</span>
                    <span>{ticket.company}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-white">{ticket.title}</h3>
                  <p className="mt-2 text-xs text-slate-400">{ticket.requester} via {ticket.channel}</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <div>{ticket.age}</div>
                  <div className="mt-2 rounded-full bg-white/8 px-2 py-1 text-[11px] text-white">{ticket.priority}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,22,39,0.9),rgba(8,12,23,0.96))] p-5 shadow-[0_24px_60px_rgba(2,6,18,0.35)]">
        <PageHeader
          eyebrow="Live ticket"
          title={activeTicket.title}
          description={`${activeTicket.company} • ${activeTicket.requester} • ${activeTicket.sentiment}`}
          action={
            <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              AI draft ready
            </div>
          }
        />

        <div className="mt-6 space-y-4">
          {timeline.map((entry) => (
            <article key={`${entry.actor}-${entry.time}`} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-white">{entry.actor}</h3>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{entry.role}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock3 className="h-3.5 w-3.5" />
                  {entry.time}
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
              <p className="text-sm font-medium text-white">Suggested reply</p>
              <p className="text-xs text-cyan-100/70">Grounded in billing policy v4.2 and related refund runbook</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-100">
            Thanks for flagging this. I checked the upgrade invoice and the previous annual invoice state.
            Right now we see one successful upgrade charge and one earlier invoice that is still pending
            capture rather than fully settled. We have prepared the refund workflow if that pending capture
            completes, and I will confirm the final outcome with the exact invoice IDs as soon as Stripe settles the sequence.
          </p>
        </div>
      </div>

      <aside className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,17,30,0.94),rgba(8,12,22,0.98))] p-4 shadow-[0_24px_60px_rgba(2,6,18,0.35)]">
        <PageHeader
          eyebrow="Run trace"
          title="OpenCode execution"
          description="This is the protected workspace entry point; real run orchestration lands in the next milestone."
          action={
            <Link href="/architecture" className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-950">
              Architecture
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-400/15 text-fuchsia-200">
              <Command className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">OpenCode run</p>
              <p className="text-xs text-slate-400">run_01HT9P3J5R3M</p>
            </div>
          </div>
          <div className="mt-4 rounded-[20px] border border-white/10 bg-[#050c17] p-3 font-mono text-[11px] text-cyan-100/80">
            opencode run --model openai/gpt-5.4 --dir . --format json investigate duplicate billing flow
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="space-y-3">
            {agentActions.map((action) => (
              <article key={action.tool} className="rounded-[20px] border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium text-white">{action.tool}</h3>
                  <span className="rounded-full bg-white/8 px-2 py-1 text-[11px] text-slate-200">{action.status}</span>
                </div>
                <p className="mt-2 text-xs leading-6 text-slate-400">{action.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}
