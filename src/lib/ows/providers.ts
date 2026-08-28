/**
 * Provider catalog.
 *
 * This is the single extension point for integrations. Adding a connector later
 * means adding an entry here (and, when real API work lands, a connector module
 * that fills in `capabilities` + flips `integration` to "connected").
 *
 * Nothing in the UI is hard-coded around a specific provider: every screen
 * reads from this catalog and falls back to the "custom" entry.
 */

export type ProviderCapability =
  | "oauth"
  | "notifications"
  | "status"
  | "billing"
  | "deployments"
  | "access"
  | "analytics"
  | "actions"
  | "data_transfer";

export type IntegrationState = "manual" | "planned" | "connected";

export interface ProviderDefinition {
  id: string;
  label: string;
  /** Literal third-party brand colour, used only for the provider mark. */
  color: string;
  category: string;
  docsUrl: string;
  /** What a real connector for this provider is expected to expose. */
  plannedCapabilities: ProviderCapability[];
  /** Whether a real API connector exists yet. */
  integration: IntegrationState;
}

export const PROVIDERS: ProviderDefinition[] = [
  {
    id: "aws",
    label: "AWS",
    color: "#ff9900",
    category: "Cloud infrastructure",
    docsUrl: "https://console.aws.amazon.com/",
    plannedCapabilities: ["oauth", "status", "billing", "notifications", "access", "actions"],
    integration: "planned",
  },
  {
    id: "stripe",
    label: "Stripe",
    color: "#635bff",
    category: "Payments",
    docsUrl: "https://dashboard.stripe.com/",
    plannedCapabilities: ["oauth", "billing", "notifications", "analytics", "status"],
    integration: "planned",
  },
  {
    id: "github",
    label: "GitHub",
    color: "#111111",
    category: "Source control",
    docsUrl: "https://github.com/",
    plannedCapabilities: ["oauth", "deployments", "notifications", "access", "status", "actions"],
    integration: "planned",
  },
  {
    id: "vercel",
    label: "Vercel",
    color: "#111111",
    category: "Hosting",
    docsUrl: "https://vercel.com/dashboard",
    plannedCapabilities: ["oauth", "deployments", "status", "notifications", "actions"],
    integration: "planned",
  },
  {
    id: "google_workspace",
    label: "Google Workspace",
    color: "#4285f4",
    category: "Identity & productivity",
    docsUrl: "https://admin.google.com/",
    plannedCapabilities: ["oauth", "access", "notifications", "billing"],
    integration: "planned",
  },
  {
    id: "twilio",
    label: "Twilio",
    color: "#f22f46",
    category: "Messaging",
    docsUrl: "https://console.twilio.com/",
    plannedCapabilities: ["status", "notifications", "billing", "analytics"],
    integration: "manual",
  },
  {
    id: "netlify",
    label: "Netlify",
    color: "#00c7b7",
    category: "Hosting",
    docsUrl: "https://app.netlify.com/",
    plannedCapabilities: ["deployments", "status", "notifications"],
    integration: "manual",
  },
  {
    id: "cloudflare",
    label: "Cloudflare",
    color: "#f6821f",
    category: "Network & DNS",
    docsUrl: "https://dash.cloudflare.com/",
    plannedCapabilities: ["status", "notifications", "analytics"],
    integration: "manual",
  },
  {
    id: "crm",
    label: "CRM",
    color: "#0f766e",
    category: "Sales & customers",
    docsUrl: "",
    plannedCapabilities: ["access", "analytics", "data_transfer"],
    integration: "manual",
  },
  {
    id: "analytics",
    label: "Analytics",
    color: "#7c3aed",
    category: "Analytics",
    docsUrl: "",
    plannedCapabilities: ["analytics", "data_transfer"],
    integration: "manual",
  },
  {
    id: "email",
    label: "Email platform",
    color: "#ea580c",
    category: "Marketing",
    docsUrl: "",
    plannedCapabilities: ["notifications", "analytics", "data_transfer"],
    integration: "manual",
  },
  {
    id: "custom",
    label: "Custom system",
    color: "#64748b",
    category: "Other",
    docsUrl: "",
    plannedCapabilities: [],
    integration: "manual",
  },
];

export const CAPABILITY_LABELS: Record<ProviderCapability, string> = {
  oauth: "Account authorization",
  notifications: "Notifications",
  status: "Status information",
  billing: "Billing information",
  deployments: "Deployments",
  access: "User & access information",
  analytics: "Analytics",
  actions: "Approved actions",
  data_transfer: "Data transfer",
};

export function getProvider(id: string | null | undefined): ProviderDefinition {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[PROVIDERS.length - 1]!;
}

/** Providers highlighted as the first integration wedge. */
export const WEDGE_PROVIDER_IDS = ["github", "vercel", "aws", "stripe", "google_workspace"];
