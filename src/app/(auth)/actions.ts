"use server";

import { redirect } from "next/navigation";
import { acceptInviteWithNewUser, createUserWithOrganization, validateUserCredentials } from "@/lib/auth/queries";
import { clearSession, createSession, requireSession } from "@/lib/auth/session";
import { loginSchema, signUpSchema } from "@/lib/validation/auth";

function getErrorRedirect(pathname: string, message: string) {
  return `${pathname}?error=${encodeURIComponent(message)}`;
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(getErrorRedirect("/login", parsed.error.issues[0]?.message ?? "Invalid login."));
  }

  const user = await validateUserCredentials(parsed.data.email, parsed.data.password);

  if (!user) {
    redirect(getErrorRedirect("/login", "Invalid email or password."));
  }

  await createSession(user.id);

  const session = await requireSession();
  const firstOrganization = session.organizations[0];

  redirect(firstOrganization ? `/app/${firstOrganization.slug}/inbox` : "/onboarding");
}

export async function signupAction(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    organizationName: formData.get("organizationName"),
  });

  if (!parsed.success) {
    redirect(getErrorRedirect("/signup", parsed.error.issues[0]?.message ?? "Invalid signup."));
  }

  try {
    const result = await createUserWithOrganization(parsed.data);
    await createSession(result.userId);
    return redirect(`/app/${result.organizationSlug}/inbox`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create account.";
    redirect(getErrorRedirect("/signup", message));
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function acceptInviteAction(formData: FormData) {
  const token = formData.get("token");
  const name = formData.get("name");
  const password = formData.get("password");

  if (typeof token !== "string" || typeof name !== "string" || typeof password !== "string") {
    redirect(getErrorRedirect("/login", "Invalid invite acceptance request."));
  }

  let result: { userId: string; organizationSlug: string };

  try {
    result = await acceptInviteWithNewUser({
      token,
      name: name.trim(),
      password,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to accept invite.";
    redirect(`/invite/${token}?error=${encodeURIComponent(message)}`);
  }

  await createSession(result.userId);
  redirect(`/app/${result.organizationSlug}/inbox`);
}
