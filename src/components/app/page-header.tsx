type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-1 pb-5">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-slate-400">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{description}</p>
      </div>
      {action}
    </div>
  );
}
