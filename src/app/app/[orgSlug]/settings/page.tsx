import { PageHeader } from "@/components/app/page-header";

const settings = [
  {
    name: "Organization slug",
    value: "Tenant-specific route base for the workspace",
  },
  {
    name: "Session auth",
    value: "Cookie-backed server session with db-persisted expiry",
  },
  {
    name: "Default inbox",
    value: "Created automatically when the tenant owner signs up",
  },
];

export default function SettingsPage() {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.9),rgba(7,12,24,0.92))] p-5 shadow-[0_24px_60px_rgba(2,6,18,0.35)]">
      <PageHeader
        eyebrow="Settings"
        title="Tenant foundation"
        description="Milestone 1 establishes real authentication, organization routing, and durable persistence instead of fake demo state."
      />
      <div className="mt-6 divide-y divide-white/10 rounded-[24px] border border-white/10 bg-white/5">
        {settings.map((item) => (
          <div key={item.name} className="px-5 py-4">
            <h3 className="text-sm font-medium text-white">{item.name}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
