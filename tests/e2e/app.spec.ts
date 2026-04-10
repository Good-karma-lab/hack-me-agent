import { expect, test, type Browser, type Page } from "@playwright/test";

async function createWorkspace(page: Page, suffix: string) {
  const email = `owner+${suffix}@playwright-support.test`;
  const workspace = `Playwright Support ${suffix}`;

  await page.goto("/signup");
  await page.getByTestId("field-name").fill("Playwright Owner");
  await page.getByTestId("field-email").fill(email);
  await page.getByTestId("field-organizationName").fill(workspace);
  await page.getByTestId("field-password").fill("Sup3rSecretPass!");
  await page.getByTestId("signup-submit").click();
  await expect(page).toHaveURL(/\/app\/.+\/inbox(?:\/.+)?/);

  const match = page.url().match(/\/app\/([^/]+)\//);
  if (!match) {
    throw new Error(`Could not determine org slug from ${page.url()}`);
  }

  await expect(page.getByTestId("reply-body")).toBeVisible();

  return {
    email,
    workspace,
    orgSlug: match[1],
  };
}

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByTestId("field-email").fill(email);
  await page.getByTestId("field-password").fill("Sup3rSecretPass!");
  await page.getByTestId("login-submit").click();
}

test("customer support tenant flow works end-to-end", async ({ page }) => {
  await createWorkspace(page, "flow");

  await expect(page.getByTestId("nav-inbox")).toHaveAttribute("data-active", "true");

  await page.getByTestId("reply-body").fill("Following up from Playwright with a tenant-scoped reply.");
  await page.getByTestId("reply-submit").click();
  await expect(page.getByText("Following up from Playwright with a tenant-scoped reply.")).toBeVisible();

  await page.getByTestId("nav-knowledge").click();
  await expect(page.getByTestId("nav-knowledge")).toHaveAttribute("data-active", "true");
  await page.getByTestId("knowledge-title").fill("Refund escalation matrix");
  await page.getByTestId("knowledge-source").fill("playbook");
  await page.getByTestId("knowledge-body").fill("Escalate duplicate billing over $250 to the workspace owner.");
  await page.getByTestId("knowledge-submit").click();
  await expect(page.getByText("Refund escalation matrix")).toBeVisible();

  await page.getByTestId("nav-settings").click();
  await page.getByTestId("integration-provider").fill("mcp-remote");
  await page.getByTestId("integration-label").fill("Docs MCP");
  await page.getByTestId("integration-config").fill('{"type":"remote","url":"https://example.com/mcp","headers":{"Authorization":"Bearer token"}}');
  await page.getByTestId("integration-submit").click();
  await expect(page.getByText("Docs MCP")).toBeVisible();

  const toggle = page.locator('[data-testid^="integration-toggle-"]').last();
  const toggleId = await toggle.getAttribute("data-testid");
  const integrationId = toggleId?.replace("integration-toggle-", "");
  await toggle.click();
  await expect(page.getByTestId(`integration-status-${integrationId}`)).toHaveText("inactive");

  await page.getByTestId("nav-inbox").click();
  await expect(page.getByTestId("nav-inbox")).toHaveAttribute("data-active", "true");
  await page.getByTestId("agent-prompt").fill("Summarize the root cause and draft the safest reply for this customer.");
  await page.getByTestId("run-copilot-submit").click();
  await expect(page.getByText("The assistant started working.")).toBeVisible();
  await expect(page.getByText("SignalDesk Agent")).toBeVisible({ timeout: 120000 });
  await expect(page.getByTestId("run-status-detail")).not.toHaveText("idle");
});

test("invite acceptance creates a second real workspace member", async ({ page, browser }) => {
  const owner = await createWorkspace(page, "invite-owner");

  await page.getByTestId("nav-settings").click();
  await page.getByTestId("invite-email").fill("teammate@playwright-support.test");
  await page.getByTestId("invite-role").selectOption("member");
  await page.getByTestId("invite-submit").click();
  await expect(page).toHaveURL(/invite=/);

  const inviteHref = await page.getByTestId("invite-link").getAttribute("href");
  if (!inviteHref) {
    throw new Error("Invite href missing.");
  }

  const teammateContext = await createTeammateContext(browser, inviteHref);
  const teammatePage = teammateContext.page;

  await expect(teammatePage).toHaveURL(new RegExp(`/app/${owner.orgSlug}/inbox(?:/.+)?`));
  await expect(teammatePage.getByTestId("reply-body")).toBeVisible();
  await teammateContext.context.close();

  await page.reload();
  await expect(page.getByText("Teammate User")).toBeVisible();
  await expect(page.getByTestId("member-role-teammate@playwright-support.test")).toHaveText("member");
});

async function createTeammateContext(browser: Browser, inviteHref: string) {
  const context = await browser.newContext({ baseURL: "http://127.0.0.1:3000" });
  const page = await context.newPage();
  await page.goto(inviteHref);
  await page.getByTestId("field-name").fill("Teammate User");
  await page.getByTestId("field-password").fill("Sup3rSecretPass!");
  await page.getByTestId("invite-accept-submit").click();
  return { context, page };
}

test("auth redirects, validation errors, and approval-backed actions work end-to-end", async ({ page }) => {
  const owner = await createWorkspace(page, "auth-approval");

  await page.getByTestId("logout-submit").click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/app");
  await expect(page).toHaveURL(/\/login/);

  await login(page, owner.email);
  await expect(page).toHaveURL(new RegExp(`/app/${owner.orgSlug}/inbox(?:/.+)?`));

  await page.getByTestId("nav-settings").click();
  await page.getByTestId("integration-provider").fill("broken");
  await page.getByTestId("integration-label").fill("Broken integration");
  await page.getByTestId("integration-config").fill('{"type":"remote","headers":{"Authorization":"Bearer token"}}');
  await page.getByTestId("integration-submit").click();
  await expect(page.getByText(/Remote MCP integrations require an absolute/)).toBeVisible();

  await page.getByTestId("nav-approvals").click();
  const executableApproval = page.locator('[data-testid^="approval-operation-"]').first();
  const approvalId = (await executableApproval.getAttribute("data-testid"))?.replace("approval-operation-", "");
  await page.getByTestId(`approve-${approvalId}`).click();
  await expect(page.getByTestId(`approval-status-${approvalId}`)).toHaveText("approved");

  await page.getByTestId("nav-inbox").click();
  await page.locator('[data-testid^="ticket-link-"]').first().click();
  await expect(page.getByTestId("ticket-status")).toHaveText("awaiting-approval");
  await expect(page.getByText("Approver")).toBeVisible();
});
