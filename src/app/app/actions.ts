"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrganizationAccess } from "@/lib/auth/session";
import { runTicketCopilot } from "@/lib/opencode/service";
import {
  addIntegration,
  addKnowledgeDocument,
  addTicketReply,
  updateApprovalRequestStatus,
} from "@/lib/support/queries";

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing ${key}.`);
  }
  return value.trim();
}

export async function createKnowledgeDocumentAction(formData: FormData) {
  const orgSlug = requiredString(formData, "orgSlug");
  const { organization } = await requireOrganizationAccess(orgSlug);

  await addKnowledgeDocument({
    organizationId: organization.id,
    title: requiredString(formData, "title"),
    body: requiredString(formData, "body"),
    source: requiredString(formData, "source"),
  });

  revalidatePath(`/app/${orgSlug}/knowledge`);
}

export async function addTicketReplyAction(formData: FormData) {
  const orgSlug = requiredString(formData, "orgSlug");
  const ticketId = requiredString(formData, "ticketId");
  const { session } = await requireOrganizationAccess(orgSlug);

  await addTicketReply({
    ticketId,
    authorName: session.user.name,
    body: requiredString(formData, "body"),
  });

  revalidatePath(`/app/${orgSlug}/inbox/${ticketId}`);
  revalidatePath(`/app/${orgSlug}/inbox`);
  redirect(`/app/${orgSlug}/inbox/${ticketId}`);
}

export async function updateApprovalStatusAction(formData: FormData) {
  const orgSlug = requiredString(formData, "orgSlug");
  const approvalId = requiredString(formData, "approvalId");
  const status = requiredString(formData, "status");
  const { organization } = await requireOrganizationAccess(orgSlug);

  if (status !== "approved" && status !== "denied") {
    throw new Error("Invalid approval status.");
  }

  await updateApprovalRequestStatus({
    approvalId,
    organizationId: organization.id,
    status,
  });

  revalidatePath(`/app/${orgSlug}/approvals`);
}

export async function addIntegrationAction(formData: FormData) {
  const orgSlug = requiredString(formData, "orgSlug");
  const { organization } = await requireOrganizationAccess(orgSlug);

  await addIntegration({
    organizationId: organization.id,
    provider: requiredString(formData, "provider"),
    label: requiredString(formData, "label"),
    config: requiredString(formData, "config"),
  });

  revalidatePath(`/app/${orgSlug}/settings`);
}

export async function runTicketCopilotAction(formData: FormData) {
  const orgSlug = requiredString(formData, "orgSlug");
  const ticketId = requiredString(formData, "ticketId");
  const { organization } = await requireOrganizationAccess(orgSlug);

  await runTicketCopilot({
    organizationId: organization.id,
    ticketId,
  });

  revalidatePath(`/app/${orgSlug}/inbox/${ticketId}`);
  revalidatePath(`/app/${orgSlug}/runs`);
  revalidatePath(`/app/${orgSlug}/approvals`);
  redirect(`/app/${orgSlug}/inbox/${ticketId}`);
}
