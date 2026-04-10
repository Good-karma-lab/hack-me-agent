"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createOrganizationInvite } from "@/lib/auth/queries";
import { requireOrganizationAccess } from "@/lib/auth/session";
import { validateIntegrationConfig } from "@/lib/integrations/validation";
import { runTicketCopilot } from "@/lib/opencode/service";
import {
  addIntegration,
  addKnowledgeDocument,
  addTicketReply,
  executeApprovalRequest,
  updateIntegrationStatus,
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
  const { organization, session } = await requireOrganizationAccess(orgSlug);

  if (organization.role !== "owner" && organization.role !== "admin") {
    throw new Error("Only owners and admins can approve actions.");
  }

  if (status !== "approved" && status !== "denied") {
    throw new Error("Invalid approval status.");
  }

  await updateApprovalRequestStatus({
    approvalId,
    organizationId: organization.id,
    status,
  });

  if (status === "approved") {
    await executeApprovalRequest({
      approvalId,
      organizationId: organization.id,
      actorName: session.user.name,
    });
  }

  revalidatePath(`/app/${orgSlug}/approvals`);
  revalidatePath(`/app/${orgSlug}/inbox`);
}

export async function addIntegrationAction(formData: FormData) {
  const orgSlug = requiredString(formData, "orgSlug");
  const { organization } = await requireOrganizationAccess(orgSlug);

  if (organization.role !== "owner" && organization.role !== "admin") {
    throw new Error("Only owners and admins can manage integrations.");
  }

  try {
    const validated = validateIntegrationConfig(requiredString(formData, "config"));

    await addIntegration({
      organizationId: organization.id,
      provider: requiredString(formData, "provider"),
      label: requiredString(formData, "label"),
      config: validated.normalizedConfig,
      status: validated.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid integration config.";
    redirect(`/app/${orgSlug}/settings?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/app/${orgSlug}/settings`);
}

export async function updateIntegrationStatusAction(formData: FormData) {
  const orgSlug = requiredString(formData, "orgSlug");
  const integrationId = requiredString(formData, "integrationId");
  const status = requiredString(formData, "status");
  const { organization } = await requireOrganizationAccess(orgSlug);

  if (organization.role !== "owner" && organization.role !== "admin") {
    throw new Error("Only owners and admins can manage integrations.");
  }

  if (status !== "active" && status !== "inactive") {
    throw new Error("Invalid integration status.");
  }

  await updateIntegrationStatus({ integrationId, organizationId: organization.id, status });
  revalidatePath(`/app/${orgSlug}/settings`);
}

export async function createInviteAction(formData: FormData) {
  const orgSlug = requiredString(formData, "orgSlug");
  const { organization, session } = await requireOrganizationAccess(orgSlug);

  if (organization.role !== "owner" && organization.role !== "admin") {
    throw new Error("Only owners and admins can invite teammates.");
  }

  const role = requiredString(formData, "role");
  if (!["admin", "member", "viewer"].includes(role)) {
    throw new Error("Invalid invite role.");
  }

  let token: string;

  try {
    token = await createOrganizationInvite({
      organizationId: organization.id,
      email: requiredString(formData, "email"),
      role,
      invitedByUserId: session.user.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create invite.";
    redirect(`/app/${orgSlug}/settings?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/app/${orgSlug}/settings`);
  redirect(`/app/${orgSlug}/settings?invite=${encodeURIComponent(token)}`);
}

export async function runTicketCopilotAction(formData: FormData) {
  const orgSlug = requiredString(formData, "orgSlug");
  const ticketId = requiredString(formData, "ticketId");
  const { organization } = await requireOrganizationAccess(orgSlug);
  const userPromptValue = formData.get("userPrompt");
  const userPrompt = typeof userPromptValue === "string" && userPromptValue.trim().length > 0 ? userPromptValue.trim() : undefined;

  await runTicketCopilot({
    organizationId: organization.id,
    ticketId,
    userPrompt,
  });

  revalidatePath(`/app/${orgSlug}/inbox/${ticketId}`);
  revalidatePath(`/app/${orgSlug}/runs`);
  revalidatePath(`/app/${orgSlug}/approvals`);
  redirect(`/app/${orgSlug}/inbox/${ticketId}?copilot=started`);
}
