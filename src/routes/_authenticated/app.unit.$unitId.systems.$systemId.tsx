import { Link, createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeader, Panel } from "@/components/app/AppShell";
import { ProviderMark } from "@/components/brand/ProviderMark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as data from "@/lib/ows/data";
import { SYSTEM_STATUSES, statusDotClass, timeAgo } from "@/lib/ows/model";
import { CAPABILITY_LABELS, getProvider } from "@/lib/ows/providers";
import { useUnit } from "@/lib/ows/unit";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/unit/$unitId/systems/$systemId")({
  component: SystemDetail,
});

function SystemDetail() {
  const { unitId, systemId } = Route.useParams();
  const { unit, systems, alerts, activity, connections, flows, isAdmin, can } = useUnit();
  const { workspace, userId, members, profileName } = useWorkspace();
  const queryClient = useQueryClient();

  const system = systems.find((s) => s.id === systemId);
  if (!system) {
    return (
      <div>
        <PageHeader title="System not found" description="This system is not part of this Unit." />
        <Button asChild variant="outline">
          <Link to="/app/unit/$unitId/systems" params={{ unitId }}>
            <ArrowLeft className="size-4" /> Back to systems
          </Link>
        </Button>
      </div>
    );
  }

  const provider = getProvider(system.provider);
  const canEdit = isAdmin || can("systems.edit");
  const systemAlerts = alerts.filter((a) => a.system_id === system.id);
  const systemActivity = activity.filter((a) => a.system_id === system.id);
  const links = connections.filter(
    (c) => c.from_system_id === system.id || c.to_system_id === system.id,
  );

  async function patch(patchInput: { status?: string; responsible_user_id?: string | null }) {
    try {
      await data.updateSystem(system!.id, patchInput);
      await data.logActivity({
        workspace_id: workspace!.id,
        unit_id: unit.id,
        system_id: system!.id,
        actor_id: userId,
        action: patchInput.status ? "system.status_changed" : "system.responsible_changed",
        detail: patchInput.status
          ? `${system!.name} set to ${patchInput.status}`
          : `${system!.name} owner updated`,
      });
      void queryClient.invalidateQueries();
      toast.success("System updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update system");
    }
  }

  async function removeSystem() {
    try {
      await data.deleteSystem(system!.id);
      void queryClient.invalidateQueries();
      toast.success("System removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove system");
    }
  }

  return (
    <div>
      <Link
        to="/app/unit/$unitId/systems"
        params={{ unitId }}
        className="mb-5 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All systems in {unit.name}
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <ProviderMark providerId={system.provider} className="size-10" />
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight">{system.name}</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {provider.label} · {system.category ?? provider.category}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {system.external_url && (
            <Button asChild variant="outline" size="sm">
              <a href={system.external_url} target="_blank" rel="noreferrer">
                Open platform <ExternalLink className="size-3.5" />
              </a>
            </Button>
          )}
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => void removeSystem()}>
              <Trash2 className="size-4" /> Remove
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="State">
          <div className="space-y-4">
            <div>
              <p className="mb-1.5 text-[12px] text-muted-foreground">Current state</p>
              {canEdit ? (
                <Select value={system.status} onValueChange={(status) => void patch({ status })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SYSTEM_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="flex items-center gap-2 text-[13px]">
                  <span className={`size-1.5 rounded-full ${statusDotClass(system.status)}`} />
                  {SYSTEM_STATUSES.find((s) => s.value === system.status)?.label ?? system.status}
                </p>
              )}
            </div>
            <div>
              <p className="mb-1.5 text-[12px] text-muted-foreground">Responsible</p>
              {canEdit ? (
                <Select
                  value={system.responsible_user_id ?? ""}
                  onValueChange={(id) => void patch({ responsible_user_id: id || null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nobody yet" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {profileName(member.user_id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-[13px]">{profileName(system.responsible_user_id)}</p>
              )}
            </div>
            {system.notes && (
              <div>
                <p className="mb-1 text-[12px] text-muted-foreground">Notes</p>
                <p className="text-[13px] leading-relaxed">{system.notes}</p>
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Alerts for this system">
          {systemAlerts.length === 0 ? (
            <EmptyState>No alerts recorded.</EmptyState>
          ) : (
            <ul className="space-y-2.5">
              {systemAlerts.slice(0, 8).map((alert) => (
                <li key={alert.id} className="text-[13px]">
                  <p className="truncate">{alert.title}</p>
                  <p className="text-[11px] text-muted-foreground">{timeAgo(alert.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Connected to">
          {links.length === 0 ? (
            <EmptyState>Not part of a connected operation yet.</EmptyState>
          ) : (
            <ul className="space-y-2.5 text-[13px]">
              {links.map((link) => {
                const other =
                  link.from_system_id === system.id ? link.to_system_id : link.from_system_id;
                const outgoing = link.from_system_id === system.id;
                return (
                  <li key={link.id}>
                    <p>
                      {outgoing ? "→ " : "← "}
                      {systems.find((s) => s.id === other)?.name ?? "Another system"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {link.label ?? "passes information"} ·{" "}
                      {flows.find((f) => f.id === link.flow_id)?.name}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Integration" className="lg:col-span-2">
          <p className="text-[13px] text-muted-foreground">
            {system.integration_status === "connected"
              ? "A live connector is active for this platform."
              : "Tracked manually for now. When a live connector for this platform is available it will fill in the information below automatically."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {provider.plannedCapabilities.map((capability) => (
              <Badge key={capability} variant="secondary">
                {CAPABILITY_LABELS[capability]}
              </Badge>
            ))}
          </div>
        </Panel>

        <Panel title="History">
          {systemActivity.length === 0 ? (
            <EmptyState>Nothing recorded yet.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {systemActivity.slice(0, 8).map((event) => (
                <li key={event.id} className="text-[12px]">
                  <p>{event.detail ?? event.action}</p>
                  <p className="text-muted-foreground">
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
