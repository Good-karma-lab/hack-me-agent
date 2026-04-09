import type { LucideIcon } from "lucide-react";
import {
  Blocks,
  Bot,
  Building2,
  Cable,
  Command,
  Database,
  FileSearch,
  GitBranch,
  Lock,
  MessageSquareMore,
  Radar,
  ShieldCheck,
  Sparkles,
  Ticket,
  Workflow,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
};

export type FeatureCard = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type MetricCard = {
  label: string;
  value: string;
  detail: string;
};

export type TicketItem = {
  id: string;
  company: string;
  requester: string;
  title: string;
  priority: string;
  sentiment: string;
  channel: string;
  age: string;
};

export type TimelineItem = {
  actor: string;
  role: string;
  time: string;
  body: string;
};

export type AgentAction = {
  tool: string;
  status: string;
  detail: string;
};

export type ArchitectureLayer = {
  title: string;
  description: string;
  icon: LucideIcon;
  bullets: string[];
};

export const navItems: NavItem[] = [
  { label: "Product", href: "#product" },
  { label: "Workspace", href: "/workspace" },
  { label: "Architecture", href: "/architecture" },
  { label: "Security", href: "#security" },
];

export const trustLogos = [
  "Northstar Cloud",
  "PulseLayer",
  "Circuit Labs",
  "Branchflow",
  "Eon Commerce",
];

export const metrics: MetricCard[] = [
  {
    label: "Auto-resolved volume",
    value: "38%",
    detail: "With approvals enabled for refunds and account actions.",
  },
  {
    label: "Median first response",
    value: "46s",
    detail: "Agent drafts from policy, past tickets, and connected tools.",
  },
  {
    label: "Workspace isolation",
    value: "100%",
    detail: "Every run, retrieval, tool token, and artifact stays org-scoped.",
  },
];

export const featureCards: FeatureCard[] = [
  {
    title: "Shared inbox with agent memory",
    description:
      "Every ticket, escalation, and agent run stays attached to the exact customer, workspace, and approval trail.",
    icon: MessageSquareMore,
  },
  {
    title: "OpenCode-powered action runtime",
    description:
      "The SaaS schedules agent runs server-side and executes the OpenCode CLI in sandboxed workers with structured traces.",
    icon: Command,
  },
  {
    title: "MCP integrations per tenant",
    description:
      "Connect Stripe, Slack, Jira, internal APIs, and browser tools through a workspace-scoped MCP client registry.",
    icon: Cable,
  },
  {
    title: "Support-grade retrieval",
    description:
      "Policies, product docs, incident posts, and prior resolutions are indexed by org and project for high-signal grounding.",
    icon: FileSearch,
  },
  {
    title: "Approval gates for risky actions",
    description:
      "Refunds, account mutations, and outbound messages can require human sign-off without blocking low-risk drafting flows.",
    icon: ShieldCheck,
  },
  {
    title: "Observable by default",
    description:
      "Prompt segments, retrieval bundles, tool calls, MCP sessions, artifacts, and final responses are all logged for review.",
    icon: Radar,
  },
];

export const tickets: TicketItem[] = [
  {
    id: "T-2048",
    company: "Northstar Cloud",
    requester: "Amelia Hart",
    title: "Duplicate charge after annual plan upgrade",
    priority: "Critical",
    sentiment: "Frustrated",
    channel: "Email",
    age: "4m",
  },
  {
    id: "T-2044",
    company: "PulseLayer",
    requester: "Rohan Shah",
    title: "SSO setup blocked by missing Okta metadata",
    priority: "High",
    sentiment: "Urgent",
    channel: "Slack Connect",
    age: "11m",
  },
  {
    id: "T-2039",
    company: "Branchflow",
    requester: "Yana Lopes",
    title: "Webhook retries stopped after rotating secret",
    priority: "Medium",
    sentiment: "Concerned",
    channel: "Portal",
    age: "32m",
  },
  {
    id: "T-2031",
    company: "Circuit Labs",
    requester: "Dmitri Valev",
    title: "Export CSV missing custom fields in EU region",
    priority: "Medium",
    sentiment: "Neutral",
    channel: "Email",
    age: "1h",
  },
];

export const timeline: TimelineItem[] = [
  {
    actor: "Amelia Hart",
    role: "Customer",
    time: "2 minutes ago",
    body:
      "We upgraded to the annual enterprise plan and the account now shows two separate charges. Please confirm which one will be voided.",
  },
  {
    actor: "SignalDesk Agent",
    role: "Copilot",
    time: "90 seconds ago",
    body:
      "I found a matching Stripe event sequence. One payment is pending capture from the previous invoice and one is the upgrade invoice. Refund action requires approval.",
  },
  {
    actor: "Nadia Chen",
    role: "Support Lead",
    time: "just now",
    body:
      "Draft the reply, attach the billing explanation, and prepare the refund action if the duplicate capture settles.",
  },
];

export const agentActions: AgentAction[] = [
  {
    tool: "retrieve_context",
    status: "Complete",
    detail: "Pulled 6 policy passages, 2 past tickets, and account metadata from tenant index.",
  },
  {
    tool: "mcp.stripe.get_payment_intents",
    status: "Complete",
    detail: "Compared latest invoice, upgrade proration, and capture state for customer org_4481.",
  },
  {
    tool: "prepare_refund_action",
    status: "Pending approval",
    detail: "Refund for invoice inv_98234 is ready but blocked by billing policy threshold.",
  },
  {
    tool: "draft_customer_reply",
    status: "Complete",
    detail: "Reply cites the right invoice ids, expected settlement timing, and next-step confirmation.",
  },
];

export const architectureLayers: ArchitectureLayer[] = [
  {
    title: "Multi-tenant SaaS shell",
    description:
      "Next.js app router handles auth, organization routing, seat management, billing, admin settings, and the agent-facing support workspace.",
    icon: Building2,
    bullets: [
      "Organizations, memberships, roles, projects, inboxes",
      "Server actions and route handlers for low-latency mutations",
      "Tenant-aware pages for inbox, KB, analytics, integrations, and approvals",
    ],
  },
  {
    title: "Support domain services",
    description:
      "Typed services own tickets, conversations, KB ingestion, policies, approvals, and agent run orchestration boundaries.",
    icon: Workflow,
    bullets: [
      "Ticket intake, assignment, SLA tracking, and state changes",
      "Approval policy engine for sensitive tool actions",
      "Run coordinator converts UI intents into queued OpenCode jobs",
    ],
  },
  {
    title: "OpenCode execution plane",
    description:
      "A worker process launches the OpenCode CLI with a generated run spec, controlled tool envelope, tenant context, and artifact directory.",
    icon: Bot,
    bullets: [
      "Each run gets isolated working storage and short-lived credentials",
      "CLI stdout and structured events are normalized into run steps",
      "Non-destructive actions can auto-complete while risky ones pause for approval",
    ],
  },
  {
    title: "MCP and tool gateway",
    description:
      "Workspace integrations are registered through a tenant-scoped MCP client broker plus first-party tools for search, retrieval, and internal APIs.",
    icon: Blocks,
    bullets: [
      "Per-workspace integration credentials and allow-lists",
      "Action envelopes with request validation and audit metadata",
      "Consistent permission model across MCP tools and first-party tools",
    ],
  },
  {
    title: "Data and observability layer",
    description:
      "Postgres stores tenant data, object storage keeps artifacts, and searchable logs preserve prompt slices, tool traces, and approval decisions.",
    icon: Database,
    bullets: [
      "Row-level tenancy via org id on every mutable resource",
      "Document ingestion pipeline for KB, macros, incidents, and past tickets",
      "Reviewable audit stream for debugging and scanner training",
    ],
  },
  {
    title: "Security controls",
    description:
      "Least-privilege tokens, content separation, approval checkpoints, and tenant isolation are treated as product primitives rather than bolt-ons.",
    icon: Lock,
    bullets: [
      "Separate system instructions, retrieved content, memory, and tool results",
      "Approval policies by tool, action type, amount threshold, and role",
      "Prompt, retrieval, and execution trace capture for incident review",
    ],
  },
];

export const executionFlow = [
  {
    step: "01",
    title: "Agent intent created",
    detail:
      "A user triggers summarize, draft, investigate, or act from a ticket or inbox view.",
  },
  {
    step: "02",
    title: "Run spec assembled",
    detail:
      "The server composes tenant context, allowed tools, approval policy, customer record, and retrieval hints.",
  },
  {
    step: "03",
    title: "OpenCode CLI launched",
    detail:
      "A worker starts `opencode` with the run spec, MCP registry config, and isolated storage for artifacts.",
  },
  {
    step: "04",
    title: "Tools and approvals mediated",
    detail:
      "Read actions can continue directly; high-risk actions are persisted as approval requests and paused.",
  },
  {
    step: "05",
    title: "Trace written back",
    detail:
      "Messages, tool outputs, citations, generated drafts, and audit events stream into the SaaS UI in near real time.",
  },
];

export const designPrinciples = [
  {
    title: "Calm density",
    description:
      "Borrow the information efficiency of Linear, but tune it for support operations with warmer accents and clearer hierarchy around urgent work.",
    icon: Ticket,
  },
  {
    title: "Editorial surfaces",
    description:
      "Take Intercom’s support-product clarity and pair it with big, expressive backgrounds so the product feels premium instead of purely utilitarian.",
    icon: Sparkles,
  },
  {
    title: "Infrastructure confidence",
    description:
      "Use Vercel-style product drama in hero sections: dark depth, technical gradients, and precise typography that suggests operational trust.",
    icon: GitBranch,
  },
];
