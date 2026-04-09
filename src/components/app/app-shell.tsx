import Link from "next/link";
import { Bell, BookOpen, Bot, Building2, Inbox, Search, Settings2, Shield } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import type { AuthSession } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Inbox", href: "inbox", icon: Inbox },
  { label: "Knowledge", href: "knowledge", icon: BookOpen },
  { label: "Copilot Runs", href: "runs", icon: Bot },
  { label: "Approvals", href: "approvals", icon: Shield },
  { label: "Settings", href: "settings", icon: Settings2 },
];

type AppShellProps = {
  session: AuthSession;
  organization: {
    slug: string;
    name: string;
    role: string;
  };
  currentPath: string;
  children: React.ReactNode;
};

export function AppShell({ session, organization, currentPath, children }: AppShellProps) {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-[28px] border border-white/10 bg-white/6 px-5 py-4 shadow-[0_32px_80px_rgba(3,8,20,0.45)] backdrop-blur-xl">
          <div>
            <p className="text-xs uppercase tracking-[0.38em] text-cyan-200/70">SignalDesk Workspace</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{organization.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10">
              <Search className="h-5 w-5" />
            </button>
            <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10">
              <Bell className="h-5 w-5" />
            </button>
            <form action={logoutAction}>
              <button className="rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-50">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="mt-4 grid flex-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,25,43,0.92),rgba(8,14,25,0.96))] p-4 shadow-[0_24px_60px_rgba(2,6,18,0.35)]">
            <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-400/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-100">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{organization.name}</p>
                  <p className="text-xs text-cyan-100/70">Role: {organization.role}</p>
                </div>
              </div>
            </div>

            <nav className="mt-6 space-y-2">
              {navItems.map(({ label, href, icon: Icon }) => {
                const target = `/app/${organization.slug}/${href}`;
                const isActive = currentPath === target || currentPath.startsWith(`${target}/`);

                return (
                  <Link
                    key={label}
                    href={target}
                    data-testid={`nav-${href}`}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                      isActive
                        ? "bg-white text-slate-950 shadow-[0_14px_30px_rgba(240,249,255,0.18)]"
                        : "text-slate-300 hover:bg-white/6 hover:text-white",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Signed in as</p>
              <div className="mt-4">
                <p className="text-sm font-medium text-white">{session.user.name}</p>
                <p className="text-xs text-slate-400">{session.user.email}</p>
              </div>
            </div>
          </aside>

          <div>{children}</div>
        </div>
      </div>
    </main>
  );
}
