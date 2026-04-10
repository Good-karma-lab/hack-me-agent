import { redirect } from "next/navigation";
import { loginAction } from "@/app/(auth)/actions";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { AuthShell } from "@/components/auth/auth-shell";
import { getSession } from "@/lib/auth/session";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();

  if (session?.organizations[0]) {
    redirect(`/app/${session.organizations[0].slug}/inbox`);
  }

  const params = await searchParams;

  return (
    <AuthShell
      title="Sign in"
      description="Access your workspace and continue helping customers with shared drafts, approvals, and assistant support."
      alternateLabel="Need an account?"
      alternateHref="/signup"
      alternateCta="Create one"
      error={params.error}
    >
      <form action={loginAction} className="space-y-5">
        <AuthFormField
          label="Work email"
          name="email"
          type="email"
          placeholder="ops@northstarcloud.com"
          autoComplete="email"
        />
        <AuthFormField
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
        />
        <button
          type="submit"
          data-testid="login-submit"
          className="w-full rounded-[18px] bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-50"
        >
          Sign in
        </button>
      </form>
    </AuthShell>
  );
}
