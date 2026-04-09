import { createKnowledgeDocumentAction } from "@/app/app/actions";
import { PageHeader } from "@/components/app/page-header";
import { requireOrganizationAccess } from "@/lib/auth/session";
import { listKnowledgeDocuments } from "@/lib/support/queries";

type KnowledgePageProps = {
  params: Promise<{ orgSlug: string }>;
};

export default async function KnowledgePage({ params }: KnowledgePageProps) {
  const { orgSlug } = await params;
  const { organization } = await requireOrganizationAccess(orgSlug);
  const documents = await listKnowledgeDocuments(organization.id);

  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.9),rgba(7,12,24,0.92))] p-5 shadow-[0_24px_60px_rgba(2,6,18,0.35)]">
      <PageHeader
        eyebrow="Knowledge"
        title="Tenant-scoped support corpus"
        description="Policies, runbooks, incidents, and prior resolutions are stored as tenant-owned content for retrieval."
      />
      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {documents.map((document) => (
            <article key={document.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-medium text-white">{document.title}</h3>
                <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-slate-200">{document.source}</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-300">{document.body}</p>
            </article>
          ))}
        </div>

        <form action={createKnowledgeDocumentAction} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <h3 className="text-lg font-medium text-white">Add document</h3>
          <div className="mt-4 space-y-3">
            <input name="title" required placeholder="Title" className="w-full rounded-[18px] border border-white/10 bg-[#07111d] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
            <input name="source" required placeholder="Source: policy, incident, macro" className="w-full rounded-[18px] border border-white/10 bg-[#07111d] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
            <textarea name="body" required rows={8} placeholder="Document body" className="w-full rounded-[18px] border border-white/10 bg-[#07111d] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
            <button className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-50">Save document</button>
          </div>
        </form>
      </div>
    </section>
  );
}
