# SignalDesk

SignalDesk is a multi-tenant Customer Support Copilot SaaS concept built for local development. It is shaped like a normal B2B support platform, with an agent runtime powered by the OpenCode CLI, tenant-scoped retrieval, approval-aware actions, and MCP integrations.

## Product direction

- Shared inbox for support teams
- AI copilot for summarization, drafting, investigation, and action prep
- Tenant-scoped knowledge retrieval over policies, docs, incidents, and past tickets
- Workspace-scoped MCP integrations for systems like Stripe, Jira, Slack, and internal APIs
- Approval policies for high-risk actions like refunds and account mutations
- Full run, tool, and approval traces for observability and scanner training

## Architecture

### 1. Web application layer

- `Next.js` app-router SaaS shell
- Organization, membership, role, project, and inbox boundaries
- Ticket, knowledge base, integrations, and approval management UI

### 2. Domain services layer

- Support ticket orchestration
- Approval policy engine
- Retrieval orchestration
- Agent run coordinator

### 3. OpenCode execution layer

- Background workers launch `opencode` with a generated run spec
- Each run receives tenant context, allowed tools, short-lived credentials, and isolated artifact storage
- Structured OpenCode events are normalized into run steps and persisted for replay and auditing

### 4. Tool and MCP gateway

- First-party tools for internal search, retrieval, and product APIs
- Tenant-scoped MCP client broker for external systems
- Tool allow-lists and policy checks before execution

### 5. Data layer

- `Postgres` for organizations, tickets, runs, approvals, and audit events
- Object storage for attachments and run artifacts
- Search index / vector store for tenant knowledge retrieval

## Recommended implementation stack

- Frontend: `Next.js 16`, `React 19`, `Tailwind CSS 4`
- Backend: Next.js route handlers and server actions, plus background workers
- Database: `Postgres`
- ORM: `Drizzle` or `Prisma`
- Queue: `BullMQ` or equivalent
- Object storage: S3-compatible storage
- Auth: org-aware session auth with RBAC
- Agent runtime: OpenCode CLI
- Integrations: tenant-scoped MCP client registry

## Design direction

The UI is inspired by three current SaaS reference points discovered during research:

- Linear: calm density and precise hierarchy
- Intercom: support-oriented workspace clarity
- Vercel: high-contrast, technical polish for AI/infrastructure products

The result in this repo is deliberately not a direct clone. It uses a darker editorial palette, luminous cyan/fuchsia highlights, rounded glassy panels, and dense operational layouts tailored to a support workspace.

## Routes

- `/`: marketing and product overview
- `/workspace`: support inbox workspace mock
- `/architecture`: system architecture overview

## Development

Install dependencies:

```bash
bun install
```

Run the app:

```bash
bun run dev
```

Lint:

```bash
bun run lint
```

Build:

```bash
bun run build
```
