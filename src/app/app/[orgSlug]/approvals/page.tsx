import { PageHeader } from "@/components/app/page-header";
import { updateApprovalStatusAction } from "@/app/app/actions";
import { requireOrganizationAccess } from "@/lib/auth/session";
import { listApprovalRequests } from "@/lib/support/queries";

type ApprovalsPageProps = {
  params: Promise<{ orgSlug: string }>;
};

export default async function ApprovalsPage({ params }: ApprovalsPageProps) {
  const { orgSlug } = await params;
  const { organization } = await requireOrganizationAccess(orgSlug);
  const approvals = await listApprovalRequests(organization.id);

  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.9),rgba(7,12,24,0.92))] p-5 shadow-[0_24px_60px_rgba(2,6,18,0.35)]">
      <PageHeader
        eyebrow="Approvals"
        title="Sensitive actions require explicit sign-off"
        description="This tenant shell already enforces auth and org isolation; policy-backed approvals are the next layer."
      />
      <div className="mt-6 space-y-4">
        {approvals.map((approval) => (
          <article key={approval.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-medium text-white">{approval.title}</h3>
              <span className="rounded-full bg-amber-300/12 px-3 py-1 text-xs text-amber-100">{approval.status}</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-300">{approval.description}</p>
            {approval.status === "pending" ? (
              <div className="mt-4 flex gap-3">
                <form action={updateApprovalStatusAction}>
                  <input type="hidden" name="orgSlug" value={orgSlug} />
                  <input type="hidden" name="approvalId" value={approval.id} />
                  <input type="hidden" name="status" value="approved" />
                  <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950">Approve</button>
                </form>
                <form action={updateApprovalStatusAction}>
                  <input type="hidden" name="orgSlug" value={orgSlug} />
                  <input type="hidden" name="approvalId" value={approval.id} />
                  <input type="hidden" name="status" value="denied" />
                  <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white">Deny</button>
                </form>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
