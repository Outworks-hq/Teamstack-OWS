import { supabase } from "@/integrations/supabase/client";

import { demo, isDemoMode } from "./demo";

import type {
  ActivityEvent,
  BillingRecord,
  Flow,
  Invitation,
  Notification,
  Profile,
  SystemConnection,
  SystemRecord,
  Unit,
  UnitMember,
  Workspace,
  WorkspaceMember,
} from "./model";

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

/* ---------------------------------------------------------------- workspaces */

export async function ensureProfile(user: { id: string; email?: string | undefined; name?: string | undefined }) {
  if (isDemoMode()) return;
  await supabase
    .from("profiles")
    .upsert({ id: user.id, email: user.email ?? "", full_name: user.name ?? null }, { onConflict: "id" });
  await supabase.rpc("accept_my_invitations");
}

export async function listWorkspaces(): Promise<Workspace[]> {
  if (isDemoMode()) return demo.listWorkspaces() as never;
  return unwrap(await supabase.from("workspaces").select("*").order("created_at"));
}

export async function createWorkspace(name: string): Promise<string> {
  if (isDemoMode()) return demo.createWorkspace(name) as never;
  const { data, error } = await supabase.rpc("create_workspace", { _name: name });
  if (error) throw new Error(error.message);
  return data as unknown as string;
}

export async function updateWorkspace(id: string, patch: Partial<Workspace>) {
  if (isDemoMode()) return demo.updateWorkspace(id, patch) as never;
  const { error } = await supabase.from("workspaces").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  if (isDemoMode()) return demo.listWorkspaceMembers(workspaceId) as never;
  return unwrap(
    await supabase.from("workspace_members").select("*").eq("workspace_id", workspaceId).order("created_at"),
  );
}

export async function listProfiles(ids: string[]): Promise<Profile[]> {
  if (isDemoMode()) return demo.listProfiles(ids) as never;
  if (ids.length === 0) return [];
  return unwrap(await supabase.from("profiles").select("*").in("id", ids));
}

export async function updateWorkspaceMemberRole(id: string, role: string) {
  if (isDemoMode()) return demo.updateWorkspaceMemberRole(id, role) as never;
  const { error } = await supabase.from("workspace_members").update({ role }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function removeWorkspaceMember(id: string) {
  if (isDemoMode()) return demo.removeWorkspaceMember(id) as never;
  const { error } = await supabase.from("workspace_members").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* --------------------------------------------------------------------- units */

export async function listUnits(workspaceId: string): Promise<Unit[]> {
  if (isDemoMode()) return demo.listUnits(workspaceId) as never;
  return unwrap(await supabase.from("units").select("*").eq("workspace_id", workspaceId).order("created_at"));
}

export async function createUnit(input: {
  workspace_id: string;
  name: string;
  purpose?: string | null;
  enabled_functions: string[];
  billing_mode: string;
  payer_user_id?: string | null;
  created_by: string;
}): Promise<Unit> {
  if (isDemoMode()) return demo.createUnit(input) as never;
  const { data, error } = await supabase.from("units").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateUnit(id: string, patch: Partial<Unit>) {
  if (isDemoMode()) return demo.updateUnit(id, patch) as never;
  const { error } = await supabase.from("units").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteUnit(id: string) {
  if (isDemoMode()) return demo.deleteUnit(id) as never;
  const { error } = await supabase.from("units").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listUnitMembers(workspaceId: string): Promise<UnitMember[]> {
  if (isDemoMode()) return demo.listUnitMembers(workspaceId) as never;
  return unwrap(await supabase.from("unit_members").select("*").eq("workspace_id", workspaceId));
}

export async function addUnitMember(input: {
  unit_id: string;
  workspace_id: string;
  user_id: string;
  role: string;
  permissions: string[];
}) {
  if (isDemoMode()) return demo.addUnitMember(input) as never;
  const { error } = await supabase.from("unit_members").upsert(input, { onConflict: "unit_id,user_id" });
  if (error) throw new Error(error.message);
}

export async function updateUnitMember(id: string, patch: Partial<UnitMember>) {
  if (isDemoMode()) return demo.updateUnitMember(id, patch) as never;
  const { error } = await supabase.from("unit_members").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function removeUnitMember(id: string) {
  if (isDemoMode()) return demo.removeUnitMember(id) as never;
  const { error } = await supabase.from("unit_members").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------- systems */

export async function listSystems(workspaceId: string): Promise<SystemRecord[]> {
  if (isDemoMode()) return demo.listSystems(workspaceId) as never;
  return unwrap(await supabase.from("systems").select("*").eq("workspace_id", workspaceId).order("created_at"));
}

export async function getSystem(id: string): Promise<SystemRecord> {
  if (isDemoMode()) return demo.getSystem(id) as never;
  const { data, error } = await supabase.from("systems").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createSystem(input: {
  workspace_id: string;
  unit_id: string | null;
  provider: string;
  name: string;
  category?: string | null;
  external_url?: string | null;
  notes?: string | null;
  status?: string;
  responsible_user_id?: string | null;
  created_by: string;
}): Promise<SystemRecord> {
  if (isDemoMode()) return demo.createSystem(input) as never;
  const { data, error } = await supabase.from("systems").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateSystem(id: string, patch: Partial<SystemRecord>) {
  if (isDemoMode()) return demo.updateSystem(id, patch) as never;
  const { error } = await supabase.from("systems").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteSystem(id: string) {
  if (isDemoMode()) return demo.deleteSystem(id) as never;
  const { error } = await supabase.from("systems").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------- notifications & log */

export async function listNotifications(workspaceId: string): Promise<Notification[]> {
  if (isDemoMode()) return demo.listNotifications(workspaceId) as never;
  return unwrap(
    await supabase
      .from("notifications")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(200),
  );
}

export async function createNotification(input: {
  workspace_id: string;
  unit_id: string | null;
  system_id: string | null;
  severity: string;
  title: string;
  body?: string | null;
  created_by: string;
}) {
  if (isDemoMode()) return demo.createNotification(input) as never;
  const { error } = await supabase.from("notifications").insert(input);
  if (error) throw new Error(error.message);
}

export async function resolveNotification(id: string) {
  if (isDemoMode()) return demo.resolveNotification(id) as never;
  const { error } = await supabase
    .from("notifications")
    .update({ severity: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listActivity(workspaceId: string): Promise<ActivityEvent[]> {
  if (isDemoMode()) return demo.listActivity(workspaceId) as never;
  return unwrap(
    await supabase
      .from("activity_events")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(200),
  );
}

export async function logActivity(input: {
  workspace_id: string;
  unit_id?: string | null;
  system_id?: string | null;
  actor_id: string;
  action: string;
  detail?: string | null;
}) {
  if (isDemoMode()) return demo.logActivity(input) as never;
  await supabase.from("activity_events").insert(input);
}

/* --------------------------------------------------- connected operations */

export async function listFlows(workspaceId: string): Promise<Flow[]> {
  if (isDemoMode()) return demo.listFlows(workspaceId) as never;
  return unwrap(await supabase.from("flows").select("*").eq("workspace_id", workspaceId).order("created_at"));
}

export async function createFlow(input: {
  workspace_id: string;
  unit_id: string | null;
  name: string;
  description?: string | null;
}): Promise<Flow> {
  if (isDemoMode()) return demo.createFlow(input) as never;
  const { data, error } = await supabase.from("flows").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteFlow(id: string) {
  if (isDemoMode()) return demo.deleteFlow(id) as never;
  const { error } = await supabase.from("flows").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listConnections(workspaceId: string): Promise<SystemConnection[]> {
  if (isDemoMode()) return demo.listConnections(workspaceId) as never;
  return unwrap(
    await supabase.from("system_connections").select("*").eq("workspace_id", workspaceId).order("position"),
  );
}

export async function createConnection(input: {
  workspace_id: string;
  flow_id: string;
  from_system_id: string;
  to_system_id: string;
  label?: string | null;
  position: number;
}) {
  if (isDemoMode()) return demo.createConnection(input) as never;
  const { error } = await supabase.from("system_connections").insert(input);
  if (error) throw new Error(error.message);
}

export async function deleteConnection(id: string) {
  if (isDemoMode()) return demo.deleteConnection(id) as never;
  const { error } = await supabase.from("system_connections").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ---------------------------------------------------- invitations & billing */

export async function listInvitations(workspaceId: string): Promise<Invitation[]> {
  if (isDemoMode()) return demo.listInvitations(workspaceId) as never;
  return unwrap(
    await supabase.from("invitations").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
  );
}

export async function createInvitation(input: {
  workspace_id: string;
  unit_id: string | null;
  email: string;
  workspace_role: string;
  unit_role: string;
  invited_by: string;
}) {
  if (isDemoMode()) return demo.createInvitation(input) as never;
  const { error } = await supabase.from("invitations").insert(input);
  if (error) throw new Error(error.message);
}

export async function revokeInvitation(id: string) {
  if (isDemoMode()) return demo.revokeInvitation(id) as never;
  const { error } = await supabase.from("invitations").update({ status: "revoked" }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listBilling(workspaceId: string): Promise<BillingRecord[]> {
  if (isDemoMode()) return demo.listBilling(workspaceId) as never;
  return unwrap(
    await supabase.from("billing_records").select("*").eq("workspace_id", workspaceId).order("period_start", { ascending: false }),
  );
}

export async function upsertBillingRecord(input: {
  workspace_id: string;
  unit_id: string | null;
  amount_cents: number;
  payer_user_id: string | null;
  status: string;
}) {
  if (isDemoMode()) return demo.upsertBillingRecord(input) as never;
  const { error } = await supabase.from("billing_records").insert(input);
  if (error) throw new Error(error.message);
}
