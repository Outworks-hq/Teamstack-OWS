import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BellPlus, Lock, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader, Panel } from "@/components/app/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProvider } from "@/lib/ows/providers";
import * as data from "@/lib/ows/data";
import { timeAgo } from "@/lib/ows/model";
import { useUnit } from "@/lib/ows/unit";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/unit/$unitId/actions")({
  component: UnitActions,
});

function UnitActions() {
  const { unit, systems, activity, isAdmin, can } = useUnit();
  const { workspace, userId, profileName } = useWorkspace();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const canAct = isAdmin || can("alerts.create");
  const actionHistory = activity.filter((event) => event.action.startsWith("action."));

  async function runCheck() {
    setBusy(true);
    try {
      await data.logActivity({
        workspace_id: workspace!.id,
        unit_id: unit.id,
        actor_id: userId,
        action: "action.status_check",
        detail: `Status check run across ${systems.length} systems in ${unit.name}`,
      });
      void queryClient.invalidateQueries();
      toast.success("Status check recorded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not run the check");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Actions"
        description={`Everyday things you can do in ${unit.name} without opening each platform yourself.`}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Available now" className="lg:col-span-2">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border p-4">
              <RefreshCw className="size-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium">Run a status check</p>
                <p className="text-[12px] text-muted-foreground">
                  Records that someone reviewed every system in this Unit.
                </p>
              </div>
              <Button size="sm" variant="outline" disabled={!canAct || busy} onClick={() => void runCheck()}>
                Run
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-xl border p-4">
              <BellPlus className="size-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium">Record an alert</p>
                <p className="text-[12px] text-muted-foreground">
                  Raise something the rest of the Unit should know about.
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <a href={`/app/unit/${unit.id}/alerts`}>Open alerts</a>
              </Button>
            </div>
          </div>
          {!canAct && (
            <p className="mt-4 text-[12px] text-muted-foreground">
              Your role in this Unit can view actions but not run them.
            </p>
          )}
        </Panel>

        <Panel title="Waiting on live connectors">
          <p className="text-[13px] text-muted-foreground">
            Actions that change a platform directly need a live connector. Those stay switched off
            until the connector for that platform is available.
          </p>
          {systems.length === 0 ? (
            <EmptyState>No systems connected yet.</EmptyState>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {systems.slice(0, 6).map((system) => (
                <li key={system.id} className="flex items-center gap-2 text-[13px]">
                  <Lock className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{getProvider(system.provider).label}</span>
                  <Badge variant="outline" className="ml-auto shrink-0 text-[10px]">
                    unavailable
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent actions" className="lg:col-span-3">
          {actionHistory.length === 0 ? (
            <EmptyState>No actions have been run in this Unit yet.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {actionHistory.slice(0, 10).map((event) => (
                <li key={event.id} className="text-[13px]">
                  <p>{event.detail ?? event.action}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {profileName(event.actor_id)} · {timeAgo(event.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
