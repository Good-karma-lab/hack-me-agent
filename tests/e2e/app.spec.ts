import { expect, test } from "@playwright/test";

test("customer support tenant flow works end-to-end", async ({ page }) => {
  await page.goto("/signup");

  await page.getByTestId("field-name").fill("Playwright Owner");
  await page.getByTestId("field-email").fill("owner@playwright-support.test");
  await page.getByTestId("field-organizationName").fill("Playwright Support");
  await page.getByTestId("field-password").fill("Sup3rSecretPass!");
  await page.getByTestId("signup-submit").click();

  await expect(page).toHaveURL(/\/app\/playwright-support\/inbox(?:\/.+)?/);
  await expect(page.getByTestId("reply-body")).toBeVisible();

  await page.getByTestId("reply-body").fill("Following up from Playwright with a tenant-scoped reply.");
  await page.getByTestId("reply-submit").click();
  await expect(page.getByText("Following up from Playwright with a tenant-scoped reply.")).toBeVisible();

  await page.getByTestId("nav-knowledge").click();
  await page.getByTestId("knowledge-title").fill("Refund escalation matrix");
  await page.getByTestId("knowledge-source").fill("playbook");
  await page.getByTestId("knowledge-body").fill("Escalate duplicate billing over $250 to the workspace owner.");
  await page.getByTestId("knowledge-submit").click();
  await expect(page.getByText("Refund escalation matrix")).toBeVisible();

  await page.getByTestId("nav-approvals").click();
  const firstApproval = page.locator('[data-testid^="approve-"]').first();
  const firstApprovalId = await firstApproval.getAttribute("data-testid");
  await firstApproval.click();
  await expect(page.getByTestId(`approval-status-${firstApprovalId?.replace("approve-", "")}`)).toHaveText("approved");

  await page.getByTestId("nav-settings").click();
  await page.getByTestId("integration-provider").fill("jira");
  await page.getByTestId("integration-label").fill("Playwright Jira");
  await page.getByTestId("integration-config").fill('{"project":"SUP"}');
  await page.getByTestId("integration-submit").click();
  await expect(page.getByText("Playwright Jira")).toBeVisible();

  await page.getByTestId("nav-inbox").click();
  await page.locator('[data-testid^="ticket-link-"]').nth(2).click();
  await expect(page.getByRole("heading", { name: "No run yet" })).toBeVisible();

  await page.getByRole("button", { name: "Run copilot" }).click();
  await expect(page.getByText("SignalDesk Agent")).toBeVisible();
  await expect(page.getByTestId("run-model")).not.toHaveText("pending");

  await page.getByTestId("nav-runs").click();
  await expect(page.getByText("completed").first()).toBeVisible();
});

test("auth redirects and login persistence work with the real database", async ({ page }) => {
  await page.goto("/login");

  await page.getByTestId("field-email").fill("owner@playwright-support.test");
  await page.getByTestId("field-password").fill("Sup3rSecretPass!");
  await page.getByTestId("login-submit").click();

  await expect(page).toHaveURL(/\/app\/playwright-support\/inbox(?:\/.+)?/);

  await page.getByTestId("logout-submit").click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/app");
  await expect(page).toHaveURL(/\/login/);
});

test("re-running the copilot creates another real OpenCode run", async ({ page }) => {
  await page.goto("/login");
  await page.getByTestId("field-email").fill("owner@playwright-support.test");
  await page.getByTestId("field-password").fill("Sup3rSecretPass!");
  await page.getByTestId("login-submit").click();

  await page.getByTestId("nav-inbox").click();
  await page.locator('[data-testid^="ticket-link-"]').nth(1).click();
  await page.getByRole("button", { name: "Run copilot" }).click();

  await expect(page.getByText("SignalDesk Agent")).toBeVisible();
  await page.getByTestId("nav-runs").click();
  await expect(page.locator('[data-testid^="run-card-"]')).toHaveCount(3);
});
