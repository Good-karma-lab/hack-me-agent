import { redirect } from "next/navigation";
import { signupAction } from "@/app/(auth)/actions";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { AuthShell } from "@/components/auth/auth-shell";
import { getSession } from "@/lib/auth/session";

type SignupPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const session = await getSession();

  if (session?.organizations[0]) {
    redirect(`/app/${session.organizations[0].slug}/inbox`);
  }

  const params = await searchParams;

  return (
    <AuthShell
      title="Create your workspace"
      description="Provision a real organization, owner account, session cookie, and protected tenant route in one step."
      alternateLabel="Already have an account?"
      alternateHref="/login"
      alternateCta="Sign in"
      error={params.error}
    >
      <form action={signupAction} className="space-y-5">
        <AuthFormField
          label="Full name"
          name="name"
          placeholder="Nadia Chen"
          autoComplete="name"
        />
        <AuthFormField
          label="Work email"
          name="email"
          type="email"
          placeholder="nadia@northstarcloud.com"
          autoComplete="email"
        />
        <AuthFormField
          label="Workspace name"
          name="organizationName"
          placeholder="Northstar Cloud"
          autoComplete="organization"
        />
        <AuthFormField
          label="Password"
          name="password"
          type="password"
          placeholder="Choose a strong password"
          autoComplete="new-password"
        />
        <button
          type="submit"
          data-testid="signup-submit"
          className="w-full rounded-[18px] bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-50"
        >
          Create workspace
        </button>
      </form>
    </AuthShell>
  );
}
