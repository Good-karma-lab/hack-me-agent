import { PageHeader } from "@/components/app/page-header";
import { executionFlow } from "@/lib/site-data";

export default function RunsPage() {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.9),rgba(7,12,24,0.92))] p-5 shadow-[0_24px_60px_rgba(2,6,18,0.35)]">
      <PageHeader
        eyebrow="Copilot Runs"
        title="Execution lifecycle"
        description="The protected app shell is ready. Next milestone wires these states to real OpenCode jobs and persisted traces."
      />
      <div className="mt-6 space-y-4">
        {executionFlow.map((step) => (
          <article key={step.step} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-950">
                {step.step}
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">{step.title}</h3>
                <p className="mt-1 text-sm leading-7 text-slate-300">{step.detail}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
