import type { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";
import { requireOrganizationAccess } from "@/lib/auth/session";

type OrganizationLayoutProps = {
  params: Promise<{ orgSlug: string }>;
  children: ReactNode;
};

export default async function OrganizationLayout({ params, children }: OrganizationLayoutProps) {
  const { orgSlug } = await params;
  const { session, organization } = await requireOrganizationAccess(orgSlug);

  return (
    <AppShell session={session} organization={organization}>
      {children}
    </AppShell>
  );
}
