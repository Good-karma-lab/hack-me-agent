import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";

export default async function AppEntryPage() {
  const session = await requireSession();
  const firstOrganization = session.organizations[0];

  if (firstOrganization) {
    redirect(`/app/${firstOrganization.slug}/inbox`);
  }

  redirect("/onboarding");
}
