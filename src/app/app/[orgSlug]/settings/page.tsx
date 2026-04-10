import { PageHeader } from "@/components/app/page-header";
import { addIntegrationAction, createInviteAction, updateIntegrationStatusAction } from "@/app/app/actions";
import { listOrganizationMembersAndInvites } from "@/lib/auth/queries";
import { requireOrganizationAccess } from "@/lib/auth/session";
import { listIntegrations } from "@/lib/support/queries";

type SettingsPageProps = {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ error?: string; invite?: string }>;
};

export default async function SettingsPage({ params, searchParams }: SettingsPageProps) {
  const { orgSlug } = await params;
  const { organization } = await requireOrganizationAccess(orgSlug);
  const query = await searchParams;
  const [connectedIntegrations, team] = await Promise.all([
    listIntegrations(organization.id),
    listOrganizationMembersAndInvites(organization.id),
  ]);

  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.9),rgba(7,12,24,0.92))] p-5 shadow-[0_24px_60px_rgba(2,6,18,0.35)]">
      <PageHeader
        eyebrow="Settings"
        title="Integrations and tenant controls"
        description="Workspace-scoped integrations are persisted per tenant and become the basis for the OpenCode MCP layer."
      />
      {query.error ? (
        <div className="mt-6 rounded-[20px] border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{query.error}</div>
      ) : null}
      {query.invite ? (
        <div className="mt-6 rounded-[20px] border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
          Invite created: <a data-testid="invite-link" className="underline" href={`/invite/${query.invite}`}>{`${process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000"}/invite/${query.invite}`}</a>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <article className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-medium text-white">Team members</h3>
            <div className="mt-4 space-y-3">
              {team.members.map((member) => (
                <div key={member.membershipId} className="rounded-[18px] border border-white/10 bg-[#07111d] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{member.name}</p>
                      <p className="text-xs text-slate-400">{member.email}</p>
                    </div>
                    <span data-testid={`member-role-${member.email}`} className="rounded-full bg-white/8 px-3 py-1 text-xs text-slate-200">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
            <h4 className="mt-6 text-sm font-medium text-white">Pending invites</h4>
            <div className="mt-3 space-y-3">
              {team.invites.length ? team.invites.map((invite) => (
                <div key={invite.id} className="rounded-[18px] border border-white/10 bg-[#07111d] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{invite.email}</p>
                      <p className="text-xs text-slate-400">Role: {invite.role}</p>
                    </div>
                    <span className="rounded-full bg-amber-300/12 px-3 py-1 text-xs text-amber-100">pending</span>
                  </div>
                </div>
              )) : <p className="text-sm text-slate-400">No pending invites.</p>}
            </div>
          </article>

          {connectedIntegrations.map((integration) => (
            <article key={integration.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-medium text-white">{integration.label}</h3>
                <span data-testid={`integration-status-${integration.id}`} className="rounded-full bg-emerald-300/12 px-3 py-1 text-xs text-emerald-100">{integration.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">Provider: {integration.provider}</p>
              <pre className="mt-3 overflow-x-auto rounded-[18px] border border-white/10 bg-[#07111d] p-3 text-xs text-slate-300">{integration.config}</pre>
              <form action={updateIntegrationStatusAction} className="mt-4">
                <input type="hidden" name="orgSlug" value={orgSlug} />
                <input type="hidden" name="integrationId" value={integration.id} />
                <input type="hidden" name="status" value={integration.status === "active" ? "inactive" : "active"} />
                <button data-testid={`integration-toggle-${integration.id}`} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white">
                  {integration.status === "active" ? "Disable" : "Enable"}
                </button>
              </form>
            </article>
          ))}
        </div>

        <div className="space-y-4">
          <form action={createInviteAction} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <h3 className="text-lg font-medium text-white">Invite teammate</h3>
            <div className="mt-4 space-y-3">
              <input data-testid="invite-email" name="email" required placeholder="teammate@example.com" className="w-full rounded-[18px] border border-white/10 bg-[#07111d] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
              <select data-testid="invite-role" name="role" defaultValue="member" className="w-full rounded-[18px] border border-white/10 bg-[#07111d] px-4 py-3 text-sm text-white outline-none">
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
              <button data-testid="invite-submit" className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-50">Create invite</button>
            </div>
          </form>

          <form action={addIntegrationAction} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <h3 className="text-lg font-medium text-white">Add integration</h3>
            <p className="mt-2 text-sm leading-7 text-slate-400">Use real MCP config JSON. `local` integrations require `command`; `remote` integrations require absolute `url`.</p>
            <div className="mt-4 space-y-3">
              <input data-testid="integration-provider" name="provider" required placeholder="Provider: stripe, slack, jira, mcp" className="w-full rounded-[18px] border border-white/10 bg-[#07111d] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
              <input data-testid="integration-label" name="label" required placeholder="Display label" className="w-full rounded-[18px] border border-white/10 bg-[#07111d] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
              <textarea data-testid="integration-config" name="config" required rows={9} placeholder='{"type":"remote","url":"https://example.com/mcp","headers":{"Authorization":"Bearer token"}}' className="w-full rounded-[18px] border border-white/10 bg-[#07111d] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
              <button data-testid="integration-submit" className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-50">Save integration</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
