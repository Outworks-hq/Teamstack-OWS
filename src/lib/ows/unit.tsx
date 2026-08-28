/**
 * Unit operating room context.
 *
 * A Unit is its own operating space inside a Workspace. Everything a Unit room
 * renders — systems, alerts, activity, connected operations, access, usage — is
 * loaded and scoped here once, so individual screens stay simple.
 */

import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo } from "react";

import * as data from "./data";
import type {
  ActivityEvent,
  BillingRecord,
  Flow,
  Notification,
  SystemConnection,
  SystemRecord,
  Unit,
  UnitMember,
} from "./model";
import { useWorkspace } from "./workspace";

interface UnitContextValue {
  unit: Unit;
  systems: SystemRecord[];
  alerts: Notification[];
  openAlerts: Notification[];
  activity: ActivityEvent[];
  flows: Flow[];
  connections: SystemConnection[];
  billing: BillingRecord[];
  roster: UnitMember[];
  loading: boolean;
  /** True when the Unit has no system in a degraded/down state. */
  allHealthy: boolean;
  attention: { systems: SystemRecord[]; alerts: Notification[] };
  can: (permission: string) => boolean;
  isAdmin: boolean;
}

const UnitContext = createContext<UnitContextValue | null>(null);

export function UnitProvider({ unit, children }: { unit: Unit; children: React.ReactNode }) {
  const { workspace, unitMembers, canManageUnit, hasUnitPermission } = useWorkspace();
  const workspaceId = workspace?.id ?? "";

  const systemsQuery = useQuery({
    queryKey: ["systems", workspaceId],
    queryFn: () => data.listSystems(workspaceId),
    enabled: !!workspaceId,
  });
  const alertsQuery = useQuery({
    queryKey: ["notifications", workspaceId],
    queryFn: () => data.listNotifications(workspaceId),
    enabled: !!workspaceId,
  });
  const activityQuery = useQuery({
    queryKey: ["activity", workspaceId],
    queryFn: () => data.listActivity(workspaceId),
    enabled: !!workspaceId,
  });
  const flowsQuery = useQuery({
    queryKey: ["flows", workspaceId],
    queryFn: () => data.listFlows(workspaceId),
    enabled: !!workspaceId,
  });
  const connectionsQuery = useQuery({
    queryKey: ["connections", workspaceId],
    queryFn: () => data.listConnections(workspaceId),
    enabled: !!workspaceId,
  });
  const billingQuery = useQuery({
    queryKey: ["billing", workspaceId],
    queryFn: () => data.listBilling(workspaceId),
    enabled: !!workspaceId,
  });

  const value = useMemo<UnitContextValue>(() => {
    const systems = (systemsQuery.data ?? []).filter((s) => s.unit_id === unit.id);
    const alerts = (alertsQuery.data ?? []).filter((n) => n.unit_id === unit.id);
    const flows = (flowsQuery.data ?? []).filter((f) => f.unit_id === unit.id);
    const flowIds = new Set(flows.map((f) => f.id));
    const openAlerts = alerts.filter((a) => a.severity === "critical" || a.severity === "warning");
    const unhealthy = systems.filter((s) => s.status === "degraded" || s.status === "down");

    return {
      unit,
      systems,
      alerts,
      openAlerts,
      activity: (activityQuery.data ?? []).filter((a) => a.unit_id === unit.id),
      flows,
      connections: (connectionsQuery.data ?? []).filter((c) => flowIds.has(c.flow_id)),
      billing: (billingQuery.data ?? []).filter((b) => b.unit_id === unit.id),
      roster: unitMembers.filter((m) => m.unit_id === unit.id),
      loading:
        systemsQuery.isLoading ||
        alertsQuery.isLoading ||
        activityQuery.isLoading ||
        flowsQuery.isLoading,
      allHealthy: unhealthy.length === 0 && openAlerts.length === 0,
      attention: { systems: unhealthy, alerts: openAlerts },
      can: (permission: string) => hasUnitPermission(unit.id, permission),
      isAdmin: canManageUnit(unit.id),
    };
  }, [
    unit,
    systemsQuery.data,
    systemsQuery.isLoading,
    alertsQuery.data,
    alertsQuery.isLoading,
    activityQuery.data,
    activityQuery.isLoading,
    flowsQuery.data,
    flowsQuery.isLoading,
    connectionsQuery.data,
    billingQuery.data,
    unitMembers,
    hasUnitPermission,
    canManageUnit,
  ]);

  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>;
}

export function useUnit(): UnitContextValue {
  const ctx = useContext(UnitContext);
  if (!ctx) throw new Error("useUnit must be used inside a Unit operating room");
  return ctx;
}

/** Plain-language summary of a Unit's operating state. */
export function unitStateLabel(input: {
  systems: SystemRecord[];
  attention: { systems: SystemRecord[]; alerts: Notification[] };
}): { label: string; tone: "ok" | "warning" | "critical" } {
  const down = input.attention.systems.some((s) => s.status === "down");
  const critical = input.attention.alerts.some((a) => a.severity === "critical");
  if (down || critical) return { label: "Needs attention now", tone: "critical" };
  if (input.attention.systems.length > 0 || input.attention.alerts.length > 0)
    return { label: "Working, with warnings", tone: "warning" };
  if (input.systems.length === 0) return { label: "Nothing connected yet", tone: "warning" };
  return { label: "Everything is working", tone: "ok" };
}
