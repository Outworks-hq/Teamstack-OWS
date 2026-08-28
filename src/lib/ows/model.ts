import type { Database } from "@/integrations/supabase/types";

export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
export type WorkspaceMember = Database["public"]["Tables"]["workspace_members"]["Row"];
export type Unit = Database["public"]["Tables"]["units"]["Row"];
export type UnitMember = Database["public"]["Tables"]["unit_members"]["Row"];
export type SystemRecord = Database["public"]["Tables"]["systems"]["Row"];
export type Flow = Database["public"]["Tables"]["flows"]["Row"];
export type SystemConnection = Database["public"]["Tables"]["system_connections"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type ActivityEvent = Database["public"]["Tables"]["activity_events"]["Row"];
export type Invitation = Database["public"]["Tables"]["invitations"]["Row"];
export type BillingRecord = Database["public"]["Tables"]["billing_records"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const WORKSPACE_ROLES = [
  { value: "owner", label: "Workspace Owner" },
  { value: "admin", label: "Workspace Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
] as const;

export const UNIT_ROLES = [
  { value: "unit_admin", label: "Unit Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
] as const;

export const UNIT_FUNCTIONS = [
  { value: "console", label: "Console" },
  { value: "control_room", label: "Control Room" },
  { value: "systems", label: "Systems" },
  { value: "notifications", label: "Notifications & alerts" },
  { value: "connected_operations", label: "Connected Operations" },
  { value: "billing", label: "Billing" },
] as const;

export const CUSTOM_PERMISSIONS = [
  { value: "systems.add", label: "Add systems" },
  { value: "systems.edit", label: "Edit systems" },
  { value: "alerts.create", label: "Record alerts" },
  { value: "alerts.resolve", label: "Resolve alerts" },
  { value: "flows.edit", label: "Edit connected operations" },
  { value: "billing.view", label: "View billing" },
  { value: "members.invite", label: "Invite members" },
] as const;

export const SYSTEM_STATUSES = [
  { value: "healthy", label: "Healthy" },
  { value: "degraded", label: "Degraded" },
  { value: "down", label: "Down" },
  { value: "maintenance", label: "Maintenance" },
  { value: "unknown", label: "Unknown" },
] as const;

export const SEVERITIES = [
  { value: "info", label: "Informational" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
  { value: "resolved", label: "Resolved" },
] as const;

export function roleLabel(role: string): string {
  return (
    [...WORKSPACE_ROLES, ...UNIT_ROLES].find((r) => r.value === role)?.label ?? role
  );
}

export function statusDotClass(status: string): string {
  switch (status) {
    case "healthy":
      return "bg-success";
    case "degraded":
    case "maintenance":
      return "bg-warning";
    case "down":
      return "bg-destructive";
    default:
      return "bg-muted-foreground";
  }
}

export function severityDotClass(severity: string): string {
  switch (severity) {
    case "critical":
      return "bg-destructive";
    case "warning":
      return "bg-warning";
    case "resolved":
      return "bg-success";
    default:
      return "bg-brand";
  }
}

export function formatMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
