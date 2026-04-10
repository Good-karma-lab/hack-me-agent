import type { LucideIcon } from "lucide-react";
import {
  FileSearch,
  MessageSquareMore,
  ShieldCheck,
  Sparkles,
  Ticket,
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

export const navItems: NavItem[] = [
  { label: "Product", href: "#product" },
  { label: "Workspace", href: "/signup" },
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
    detail: "Suggested replies help teams answer faster without losing control.",
  },
  {
    label: "Team visibility",
    value: "100%",
    detail: "Every conversation, draft, approval, and teammate action stays in one shared workspace.",
  },
];

export const featureCards: FeatureCard[] = [
  {
    title: "Shared inbox for every channel",
    description:
      "Keep email, portal, and escalation conversations in one place so your team can respond together.",
    icon: MessageSquareMore,
  },
  {
    title: "Assistant help inside the ticket",
    description:
      "Ask for a summary, a reply draft, or the next best step without leaving the conversation.",
    icon: Sparkles,
  },
  {
    title: "Connected customer context",
    description:
      "Bring billing, account history, and internal notes into the same workspace so agents see the full picture.",
    icon: Ticket,
  },
  {
    title: "Helpful knowledge at hand",
    description:
      "Policies, product docs, incident notes, and past resolutions are easy to search while you work.",
    icon: FileSearch,
  },
  {
    title: "Approvals for sensitive actions",
    description:
      "Refunds, account changes, and other sensitive steps can wait for sign-off before they move forward.",
    icon: ShieldCheck,
  },
  {
    title: "Clear team history",
    description:
      "See what happened on every ticket, who approved what, and how the conversation moved forward.",
    icon: MessageSquareMore,
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
    icon: Sparkles,
  },
];
