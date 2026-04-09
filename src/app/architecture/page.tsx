import Link from "next/link";
import { ArrowRight, Check, Shield } from "lucide-react";
import { architectureLayers, executionFlow } from "@/lib/site-data";

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen bg-[#050816] px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.15),transparent_35%),linear-gradient(180deg,rgba(13,19,34,0.96),rgba(7,10,19,0.98))] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.35)] sm:p-12">
          <p className="text-xs uppercase tracking-[0.38em] text-cyan-200/70">Architecture</p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                OpenCode at the core, multi-tenant SaaS around it.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                SignalDesk treats the OpenCode CLI as the execution engine, not the whole product.
                The web app owns tenancy, permissions, approvals, storage, and observability.
              </p>
            </div>
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-50"
            >
              Open workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {architectureLayers.map(({ title, description, icon: Icon, bullets }) => (
            <article
              key={title}
              className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
              <div className="mt-5 space-y-3">
                {bullets.map((bullet) => (
                  <div key={bullet} className="flex gap-3 text-sm text-slate-200">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-cyan-200" />
                    <span className="leading-6">{bullet}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Execution flow</p>
            <div className="mt-6 space-y-4">
              {executionFlow.map((item) => (
                <article
                  key={item.step}
                  className="rounded-[22px] border border-white/10 bg-black/15 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-950">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">{item.title}</h3>
                      <p className="mt-1 text-sm leading-7 text-slate-300">{item.detail}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(103,232,249,0.08),rgba(255,255,255,0.03))] p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-100">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-white">Safety model</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
              <p>
                The agent never receives raw platform-wide authority. Every run is assembled from the
                requesting user, active organization, project scope, approved tools, and policy level.
              </p>
              <p>
                Retrieved knowledge, memory, system instructions, tool outputs, and approval decisions are
                stored separately so they can be reviewed independently during incident analysis.
              </p>
              <p>
                This is exactly the kind of normal, production-shaped agent surface that is useful for
                evaluating an AI vulnerability scanner without intentionally weakening the app.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
