import { PageHeader } from "@/components/app/page-header";

const documents = [
  {
    title: "Billing policy v4.2",
    detail: "Refund thresholds, enterprise plan proration, and capture rules.",
  },
  {
    title: "Incident response playbook",
    detail: "Customer communication steps during degraded platform states.",
  },
  {
    title: "SSO troubleshooting guide",
    detail: "Okta, Entra, and JumpCloud setup and common error signatures.",
  },
];

export default function KnowledgePage() {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.9),rgba(7,12,24,0.92))] p-5 shadow-[0_24px_60px_rgba(2,6,18,0.35)]">
      <PageHeader
        eyebrow="Knowledge"
        title="Tenant-scoped support corpus"
        description="Policies, runbooks, incidents, and prior resolutions are stored as tenant-owned content for retrieval."
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {documents.map((document) => (
          <article key={document.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-medium text-white">{document.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{document.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
