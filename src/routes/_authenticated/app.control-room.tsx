import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { EmptyState, Panel } from "@/components/app/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as data from "@/lib/ows/data";
import { severityDotClass, statusDotClass, timeAgo } from "@/lib/ows/model";
import { getProvider } from "@/lib/ows/providers";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/control-room")({
  component: ControlRoomPage,
});

function ControlRoomPage() {
  const { workspace, units, profileName, isWorkspaceAdmin, hasUnitPermission } = useWorkspace();
  const workspaceId = workspace!.id;
  const queryClient = useQueryClient();

  const systems =
    useQuery({ queryKey: ["systems", workspaceId], queryFn: () => data.listSystems(workspaceId) })
      .data ?? [];
  const notifications =
    useQuery({
      queryKey: ["notifications", workspaceId],
      queryFn: () => data.listNotifications(workspaceId),
    }).data ?? [];
  const activity =
    useQuery({ queryKey: ["activity", workspaceId], queryFn: () => data.listActivity(workspaceId) })
      .data ?? [];

  const critical = notifications.filter((n) => n.severity === "critical");
  const warnings = notifications.filter((n) => n.severity === "warning");
  const unhealthy = systems.filter((s) => s.status === "down" || s.status === "degraded");

  async function resolve(id: string) {
    try {
      await data.resolveNotification(id);
      toast.success("Alert marked resolved");
      void queryClient.invalidateQueries({ queryKey: ["notifications", workspaceId] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not resolve alert");
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Control Room</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Live incidents, system health, access and change history across {workspace!.name}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Critical alerts", value: critical.length },
          { label: "Warnings", value: warnings.length },
          { label: "Systems needing attention", value: unhealthy.length },
          { label: "Recorded events", value: activity.length },
        ].map((stat) => (
          <Panel key={stat.label} title={stat.label}>
            <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
          </Panel>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Live incidents">
          {critical.length === 0 && warnings.length === 0 ? (
            <EmptyState>No open incidents.</EmptyState>
          ) : (
            <ul className="divide-y">
              {[...critical, ...warnings].map((alert) => {
                const canResolve =
                  isWorkspaceAdmin || hasUnitPermission(alert.unit_id, "alerts.resolve");
                return (
                  <li key={alert.id} className="flex items-start gap-3 py-3">
                    <span
                      className={`mt-1.5 size-1.5 shrink-0 rounded-full ${severityDotClass(alert.severity)}`}
                    />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium">{alert.title}</p>
                      <p className="text-[12px] text-muted-foreground">
                        {units.find((u) => u.id === alert.unit_id)?.name ?? "Workspace"} ·{" "}
                        {timeAgo(alert.created_at)}
                      </p>
                      {alert.body && (
                        <p className="mt-1 text-[12px] text-muted-foreground">{alert.body}</p>
                      )}
                    </div>
                    {canResolve && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-auto"
                        onClick={() => void resolve(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="System health">
          {systems.length === 0 ? (
            <EmptyState>No systems recorded yet.</EmptyState>
          ) : (
            <ul className="divide-y">
              {systems.map((system) => (
                <li key={system.id} className="flex items-center gap-3 py-2 text-[12px]">
                  <span className={`size-1.5 rounded-full ${statusDotClass(system.status)}`} />
                  <span className="font-medium">{system.name}</span>
                  <span className="text-muted-foreground">
                    {getProvider(system.provider).label}
                  </span>
                  <Badge variant="secondary" className="ml-auto text-[10px] capitalize">
                    {system.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Team activity & access log">
          {activity.length === 0 ? (
            <EmptyState>No recorded events yet.</EmptyState>
          ) : (
            <ul className="divide-y">
              {activity.map((event) => (
                <li key={event.id} className="py-2 text-[12px]">
                  <p className="font-medium">{event.action}</p>
                  <p className="text-muted-foreground">
                    {event.detail} · {profileName(event.actor_id)} · {timeAgo(event.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recovery actions">
          <p className="text-[12px] text-muted-foreground">
            Recovery actions execute against real provider APIs. They become available for a system
            once its connector is authorized.
          </p>
          <ul className="mt-3 space-y-2">
            {["Restart service", "Roll back deployment", "Rotate credentials", "Suspend access"].map(
              (action) => (
                <li
                  key={action}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-[12px]"
                >
                  {action}
                  <Badge variant="outline" className="text-[10px]">
                    Unavailable — integration required
                  </Badge>
                </li>
              ),
            )}
          </ul>
        </Panel>
      </div>
    </>
  );
}
