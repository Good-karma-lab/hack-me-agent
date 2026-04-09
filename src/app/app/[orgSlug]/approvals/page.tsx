import { PageHeader } from "@/components/app/page-header";

const approvals = [
  {
    title: "Refund over threshold",
    detail: "Refund for invoice inv_98234 is pending owner approval because amount exceeds the policy cap.",
    status: "Awaiting owner",
  },
  {
    title: "Account mutation guard",
    detail: "Email domain allow-list update requires admin review before execution.",
    status: "Needs admin",
  },
];

export default function ApprovalsPage() {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.9),rgba(7,12,24,0.92))] p-5 shadow-[0_24px_60px_rgba(2,6,18,0.35)]">
      <PageHeader
        eyebrow="Approvals"
        title="Sensitive actions require explicit sign-off"
        description="This tenant shell already enforces auth and org isolation; policy-backed approvals are the next layer."
      />
      <div className="mt-6 space-y-4">
        {approvals.map((approval) => (
          <article key={approval.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-medium text-white">{approval.title}</h3>
              <span className="rounded-full bg-amber-300/12 px-3 py-1 text-xs text-amber-100">{approval.status}</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-300">{approval.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
