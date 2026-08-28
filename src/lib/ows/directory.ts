/**
 * Workspace-level Unit directory.
 *
 * The Workspace screen is a container, not an operations dashboard: for each
 * Unit it only needs a plain-language state summary so the user can decide
 * which operating room to enter.
 */

import { useQuery } from "@tanstack/react-query";

import * as data from "./data";
import { useWorkspace } from "./workspace";

export interface UnitSummary {
  systemCount: number;
  attentionCount: number;
  memberCount: number;
  providers: string[];
  state: { label: string; tone: "ok" | "warning" | "critical" };
}

export function useUnitDirectory(): Record<string, UnitSummary> {
  const { workspace, units, unitMembers } = useWorkspace();
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

  const systems = systemsQuery.data ?? [];
  const alerts = alertsQuery.data ?? [];

  const directory: Record<string, UnitSummary> = {};

  for (const unit of units) {
    const unitSystems = systems.filter((s) => s.unit_id === unit.id);
    const unhealthy = unitSystems.filter((s) => s.status === "degraded" || s.status === "down");
    const openAlerts = alerts.filter(
      (a) => a.unit_id === unit.id && (a.severity === "critical" || a.severity === "warning"),
    );

    const critical =
      unhealthy.some((s) => s.status === "down") ||
      openAlerts.some((a) => a.severity === "critical");

    directory[unit.id] = {
      systemCount: unitSystems.length,
      attentionCount: unhealthy.length + openAlerts.length,
      memberCount: unitMembers.filter((m) => m.unit_id === unit.id).length,
      providers: unitSystems.map((s) => s.provider),
      state: critical
        ? { label: "Needs attention now", tone: "critical" }
        : unhealthy.length + openAlerts.length > 0
          ? { label: "Working, with warnings", tone: "warning" }
          : unitSystems.length === 0
            ? { label: "Nothing connected yet", tone: "warning" }
            : { label: "Everything is working", tone: "ok" },
    };
  }

  return directory;
}
