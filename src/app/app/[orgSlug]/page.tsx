import { redirect } from "next/navigation";

type OrganizationPageProps = {
  params: Promise<{ orgSlug: string }>;
};

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const { orgSlug } = await params;
  redirect(`/app/${orgSlug}/inbox`);
}
