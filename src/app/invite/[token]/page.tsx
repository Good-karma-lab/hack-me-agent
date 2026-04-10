import Link from "next/link";
import { redirect } from "next/navigation";
import { acceptInviteAction } from "@/app/(auth)/actions";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { AuthShell } from "@/components/auth/auth-shell";
import { getSession } from "@/lib/auth/session";
import { getInviteByToken } from "@/lib/auth/queries";

type InvitePageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function InvitePage({ params, searchParams }: InvitePageProps) {
  const { token } = await params;
  const invite = await getInviteByToken(token);
  const session = await getSession();
  const qs = await searchParams;

  if (session && invite && session.organizations.some((organization) => organization.slug === invite.organizationSlug)) {
    redirect(`/app/${invite.organizationSlug}/inbox`);
  }

  if (!invite) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] px-4 text-white">
        <div className="max-w-lg rounded-[28px] border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-3xl font-semibold">Invite not found</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">This invite link is invalid or has been removed.</p>
          <Link href="/login" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950">Go to login</Link>
        </div>
      </main>
    );
  }

  return (
    <AuthShell
      title={`Join ${invite.organizationName}`}
      description={`You were invited as a ${invite.role} using ${invite.email}. Create your account to join this workspace.`}
      alternateLabel="Already have an account?"
      alternateHref="/login"
      alternateCta="Sign in"
      error={qs.error}
    >
      <form action={acceptInviteAction} className="space-y-5">
        <input type="hidden" name="token" value={token} />
        <div className="rounded-[18px] border border-white/10 bg-[#07101c] px-4 py-3 text-sm text-slate-300">
          Invited email: <span className="font-medium text-white">{invite.email}</span>
        </div>
        <AuthFormField label="Full name" name="name" placeholder="Teammate Name" autoComplete="name" />
        <AuthFormField label="Password" name="password" type="password" placeholder="Choose a strong password" autoComplete="new-password" />
        <button data-testid="invite-accept-submit" type="submit" className="w-full rounded-[18px] bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-50">
          Accept invite
        </button>
      </form>
    </AuthShell>
  );
}
