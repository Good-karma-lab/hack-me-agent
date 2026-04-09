import Link from "next/link";
import { MessageSquareText, ShieldCheck, Sparkles } from "lucide-react";

type AuthShellProps = {
  title: string;
  description: string;
  alternateLabel: string;
  alternateHref: string;
  alternateCta: string;
  error?: string;
  children: React.ReactNode;
};

const highlights = [
  "Real tenant-backed auth and organization boundaries",
  "OpenCode-driven support copilot with approval gates",
  "Built for end-to-end testing, not demo-only screenshots",
];

export function AuthShell({
  title,
  description,
  alternateLabel,
  alternateHref,
  alternateCta,
  error,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-8">
        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(192,132,252,0.16),transparent_28%),linear-gradient(180deg,rgba(12,18,33,0.96),rgba(6,10,20,0.98))] p-8 sm:p-10 lg:p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/8">
              <MessageSquareText className="h-5 w-5 text-cyan-100" />
            </div>
            <div>
              <div className="text-sm font-semibold">SignalDesk</div>
              <div className="text-xs text-slate-400">Customer Support Copilot SaaS</div>
            </div>
          </div>

          <h1 className="mt-12 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Support teams, agent runs, and tenant controls in one workspace.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            Build the kind of production-shaped agentic app you can actually test: shared inbox,
            retrieval, approvals, tool traces, and SaaS-grade access control.
          </p>

          <div className="mt-10 space-y-4">
            {highlights.map((item, index) => {
              const Icon = index === 0 ? ShieldCheck : index === 1 ? Sparkles : MessageSquareText;

              return (
                <div key={item} className="flex gap-4 rounded-[24px] border border-white/10 bg-white/6 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm leading-7 text-slate-200">{item}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[36px] border border-white/10 bg-white/6 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-white">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
              </div>
            </div>

            {error ? (
              <div className="mt-6 rounded-[20px] border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <div className="mt-8">{children}</div>

            <p className="mt-6 text-sm text-slate-400">
              {alternateLabel}{" "}
              <Link href={alternateHref} className="font-medium text-cyan-100 transition hover:text-white">
                {alternateCta}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
