import { PageHeader } from "@/components/app/page-header";
import { requireOrganizationAccess } from "@/lib/auth/session";
import { listAgentRuns } from "@/lib/support/queries";

type RunsPageProps = {
  params: Promise<{ orgSlug: string }>;
};

export default async function RunsPage({ params }: RunsPageProps) {
  const { orgSlug } = await params;
  const { organization } = await requireOrganizationAccess(orgSlug);
  const runs = await listAgentRuns(organization.id);

  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.9),rgba(7,12,24,0.92))] p-5 shadow-[0_24px_60px_rgba(2,6,18,0.35)]">
      <PageHeader
        eyebrow="Copilot Runs"
        title="Recorded agent runs"
        description="The support domain now persists run records per tenant. The next milestone will execute them through the OpenCode SDK."
      />
      <div className="mt-6 space-y-4">
        {runs.map((run) => (
          <article key={run.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-white">{run.id}</h3>
                <p className="mt-1 text-sm text-slate-400">{run.provider}/{run.model}</p>
              </div>
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-slate-200">{run.status}</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-300">{run.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
