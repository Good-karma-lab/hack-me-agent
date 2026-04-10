import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  MessageSquareText,
  Shield,
  Sparkles,
} from "lucide-react";
import {
  designPrinciples,
  featureCards,
  metrics,
  navItems,
  trustLogos,
} from "@/lib/site-data";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.14),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(167,139,250,0.2),transparent_22%),radial-gradient(circle_at_50%_80%,rgba(251,191,36,0.1),transparent_24%)]" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
              <MessageSquareText className="h-5 w-5 text-cyan-100" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide">SignalDesk</div>
              <div className="text-xs text-slate-400">Customer Support Copilot SaaS</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-50"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:pb-28 lg:pt-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 text-sm text-cyan-100">
              <Sparkles className="h-4 w-4" />
              Shared inbox, fast replies, and clearer teamwork
            </div>
            <h1 className="mt-8 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Customer support that feels calm, fast, and in control.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              SignalDesk helps support teams manage every conversation in one place, prepare better replies, and keep approvals and teamwork moving without the chaos.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-50"
              >
                Create workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                See workspace
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_18px_50px_rgba(7,11,22,0.25)] backdrop-blur-xl"
                >
                  <p className="text-sm text-slate-400">{metric.label}</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">{metric.value}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{metric.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,25,40,0.94),rgba(7,10,20,0.98))] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.38)]">
              <div className="flex items-center justify-between rounded-[28px] border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Northstar billing inbox</p>
                  <p className="mt-1 text-lg font-medium text-white">Copilot handling urgent plan issues</p>
                </div>
                <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">
                  2 runs active
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[28px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Queue</p>
                  <div className="mt-4 space-y-3">
                    {[
                      "Duplicate billing on annual upgrade",
                      "Workspace locked after SSO metadata change",
                      "Webhook retries failing in EU region",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className={`rounded-[20px] border p-3 ${
                          index === 0
                            ? "border-cyan-300/25 bg-cyan-300/10"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <p className="text-sm text-white">{item}</p>
                        <p className="mt-2 text-xs text-slate-400">See the issue, understand the context, and keep the team aligned</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(125,211,252,0.16),rgba(14,165,233,0.04))] p-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">Suggested next step</p>
                      <p className="text-xs text-cyan-100/70">Clear context, draft help, and approval checks where needed</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      "Understand the ticket and recent account history",
                      "Bring in the details needed to answer accurately",
                      "Flag anything that needs approval before it moves forward",
                      "Draft a clear reply for the customer",
                    ].map((line) => (
                      <div
                        key={line}
                        className="rounded-[18px] border border-white/10 bg-[#07111d] px-3 py-2.5 text-xs text-slate-200"
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-[22px] border border-white/10 bg-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Draft</p>
                    <p className="mt-3 text-sm leading-7 text-slate-100">
                      We found one settled upgrade invoice and one earlier invoice still pending capture. We’ve
                      prepared a refund path if that capture settles and will confirm final billing state with the
                      exact invoice IDs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section id="product" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.38em] text-cyan-200/70">Product surface</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            Everything your support team needs in one workspace.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-300">
            Bring conversations, internal knowledge, approvals, and teammate context together so every customer gets a faster, more confident answer.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(7,11,22,0.2)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,21,36,0.94),rgba(7,11,20,0.98))] p-8 sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.38em] text-cyan-200/70">Design direction</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">
                Designed for teams who spend all day in customer conversations.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                SignalDesk keeps the interface clean and focused so agents can move from triage to reply without losing context.
              </p>
            </div>
            <div className="grid gap-4">
              {designPrinciples.map(({ title, description, icon: Icon }) => (
                <article
                  key={title}
                  className="rounded-[26px] border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">{title}</h3>
                      <p className="mt-1 text-sm leading-7 text-slate-300">{description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-200">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Safe by default</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Built for trust and control.</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Separate workspaces for every team",
                "Approvals for sensitive actions and refunds",
                "Clear history for conversations and decisions",
                "Connected customer context without losing control",
                "Protected access for teammates and admins",
                "Reliable drafts grounded in your workspace knowledge",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-[20px] border border-white/10 bg-black/15 p-4 text-sm text-slate-200"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                  <span className="leading-6">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(255,255,255,0.04))] p-8">
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-100/70">Trusted by growing support teams</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-200 sm:grid-cols-3 lg:grid-cols-2">
              {trustLogos.map((logo) => (
                <div
                  key={logo}
                  className="rounded-[20px] border border-white/10 bg-black/15 px-4 py-3 text-center"
                >
                  {logo}
                </div>
              ))}
            </div>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-50"
            >
              Start your workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
