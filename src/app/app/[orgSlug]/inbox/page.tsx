import { redirect } from "next/navigation";
import { requireOrganizationAccess } from "@/lib/auth/session";
import { listTicketsForOrganization } from "@/lib/support/queries";

type InboxPageProps = {
  params: Promise<{ orgSlug: string }>;
};

export default async function InboxPage({ params }: InboxPageProps) {
  const { orgSlug } = await params;
  const { organization } = await requireOrganizationAccess(orgSlug);
  const allTickets = await listTicketsForOrganization(organization.id);

  if (allTickets[0]) {
    redirect(`/app/${orgSlug}/inbox/${allTickets[0].id}`);
  }

  return null;
}
