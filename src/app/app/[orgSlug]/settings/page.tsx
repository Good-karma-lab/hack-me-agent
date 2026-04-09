import { PageHeader } from "@/components/app/page-header";
import { addIntegrationAction } from "@/app/app/actions";
import { requireOrganizationAccess } from "@/lib/auth/session";
import { listIntegrations } from "@/lib/support/queries";

type SettingsPageProps = {
  params: Promise<{ orgSlug: string }>;
};

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { orgSlug } = await params;
  const { organization } = await requireOrganizationAccess(orgSlug);
  const connectedIntegrations = await listIntegrations(organization.id);

  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.9),rgba(7,12,24,0.92))] p-5 shadow-[0_24px_60px_rgba(2,6,18,0.35)]">
      <PageHeader
        eyebrow="Settings"
        title="Integrations and tenant controls"
        description="Workspace-scoped integrations are persisted per tenant and become the basis for the OpenCode MCP layer."
      />
      <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          {connectedIntegrations.map((integration) => (
            <article key={integration.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-medium text-white">{integration.label}</h3>
                <span className="rounded-full bg-emerald-300/12 px-3 py-1 text-xs text-emerald-100">{integration.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">Provider: {integration.provider}</p>
              <pre className="mt-3 overflow-x-auto rounded-[18px] border border-white/10 bg-[#07111d] p-3 text-xs text-slate-300">{integration.config}</pre>
            </article>
          ))}
        </div>

        <form action={addIntegrationAction} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <h3 className="text-lg font-medium text-white">Add integration</h3>
          <div className="mt-4 space-y-3">
            <input data-testid="integration-provider" name="provider" required placeholder="Provider: stripe, slack, jira" className="w-full rounded-[18px] border border-white/10 bg-[#07111d] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
            <input data-testid="integration-label" name="label" required placeholder="Display label" className="w-full rounded-[18px] border border-white/10 bg-[#07111d] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
            <textarea data-testid="integration-config" name="config" required rows={7} placeholder='JSON or notes, for example {"scope":"billing:read"}' className="w-full rounded-[18px] border border-white/10 bg-[#07111d] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
            <button data-testid="integration-submit" className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-50">Save integration</button>
          </div>
        </form>
      </div>
    </section>
  );
}
