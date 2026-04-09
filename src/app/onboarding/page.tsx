import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function OnboardingPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.organizations[0]) {
    redirect(`/app/${session.organizations[0].slug}/inbox`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050816] px-4 text-white">
      <div className="max-w-lg rounded-[28px] border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-3xl font-semibold">No workspace found</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          Your account exists, but there is no tenant attached to it yet.
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950"
        >
          Create a workspace
        </Link>
      </div>
    </main>
  );
}
