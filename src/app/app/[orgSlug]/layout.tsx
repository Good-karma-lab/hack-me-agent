import type { ReactNode } from "react";
import { headers } from "next/headers";
import { AppShell } from "@/components/app/app-shell";
import { requireOrganizationAccess } from "@/lib/auth/session";

type OrganizationLayoutProps = {
  params: Promise<{ orgSlug: string }>;
  children: ReactNode;
};

export default async function OrganizationLayout({ params, children }: OrganizationLayoutProps) {
  const { orgSlug } = await params;
  const { session, organization } = await requireOrganizationAccess(orgSlug);
  const headersList = await headers();
  const currentPath = headersList.get("x-current-path") ?? `/app/${orgSlug}/inbox`;

  return (
    <AppShell session={session} organization={organization} currentPath={currentPath}>
      {children}
    </AppShell>
  );
}
