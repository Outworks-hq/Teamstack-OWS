import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader, Panel } from "@/components/app/AppShell";
import { ProviderMark } from "@/components/brand/ProviderMark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import * as data from "@/lib/ows/data";
import { SYSTEM_STATUSES, severityDotClass, statusDotClass, timeAgo } from "@/lib/ows/model";
import { CAPABILITY_LABELS, getProvider } from "@/lib/ows/providers";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/systems/$systemId")({
  component: SystemDetailPage,
});

function SystemDetailPage() {
  const { systemId } = Route.useParams();
  const { workspace, units, members, profileName, canManageUnit } = useWorkspace();
  const workspaceId = workspace!.id;
  const queryClient = useQueryClient();

  const systemQuery = useQuery({
    queryKey: ["system", systemId],
    queryFn: () => data.getSystem(systemId),
  });
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
  const connections =
    useQuery({
      queryKey: ["connections", workspaceId],
      queryFn: () => data.listConnections(workspaceId),
    }).data ?? [];

  const system = systemQuery.data;
  const [notes, setNotes] = useState<string | null>(null);

  if (systemQuery.isLoading) {
    return <p className="text-[13px] text-muted-foreground">Loading system…</p>;
  }
  if (!system) return <EmptyState>This system could not be found.</EmptyState>;

  const provider = getProvider(system.provider);
  const unit = units.find((u) => u.id === system.unit_id) ?? null;
  const editable = canManageUnit(system.unit_id);
  const systemName = (id: string) => systems.find((s) => s.id === id)?.name ?? "Unknown system";

  async function patch(patchData: Parameters<typeof data.updateSystem>[1], message: string) {
    try {
      await data.updateSystem(systemId, patchData);
      toast.success(message);
      void queryClient.invalidateQueries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update system");
    }
  }

  return (
    <>
      <PageHeader
        title={system.name}
        description={`${provider.label} · ${system.category || provider.category}`}
        action={
          system.external_url ? (
            <Button asChild variant="outline">
              <a href={system.external_url} target="_blank" rel="noreferrer noopener">
                Open {provider.label} <ExternalLink className="size-3.5" />
              </a>
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Overview">
          <div className="flex items-center gap-3">
            <ProviderMark providerId={system.provider} className="size-10 rounded-xl text-[13px]" />
            <div>
              <p className="text-[14px] font-semibold">{system.name}</p>
              <p className="text-[12px] text-muted-foreground">{provider.label}</p>
            </div>
          </div>
          <dl className="mt-4 space-y-2 text-[12px]">
            <Row label="Unit">
              {unit ? (
                <Link to="/app/units" className="text-brand">
                  {unit.name}
                </Link>
              ) : (
                "Unassigned"
              )}
            </Row>
            <Row label="Status">
              {editable ? (
                <Select
                  value={system.status}
                  onValueChange={(status) => void patch({ status }, "Status updated")}
                >
                  <SelectTrigger className="h-7 w-[150px] text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SYSTEM_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="flex items-center gap-1.5 capitalize">
                  <span className={`size-1.5 rounded-full ${statusDotClass(system.status)}`} />
                  {system.status}
                </span>
              )}
            </Row>
            <Row label="Responsible">
              {editable ? (
                <Select
                  value={system.responsible_user_id ?? ""}
                  onValueChange={(id) =>
                    void patch({ responsible_user_id: id }, "Responsible member updated")
                  }
                >
                  <SelectTrigger className="h-7 w-[150px] text-[12px]">
                    <SelectValue placeholder="Unassigned" />
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
                profileName(system.responsible_user_id)
              )}
            </Row>
            <Row label="Integration">
              <Badge variant="outline" className="text-[10px] capitalize">
                {system.integration_status === "connected" ? "Connected" : "Organized (no API yet)"}
              </Badge>
            </Row>
          </dl>
        </Panel>

        <Panel title="Notes">
          {editable ? (
            <>
              <Textarea
                rows={6}
                value={notes ?? system.notes ?? ""}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button
                size="sm"
                className="mt-3"
                onClick={() => void patch({ notes: notes ?? system.notes }, "Notes saved")}
              >
                Save notes
              </Button>
            </>
          ) : (
            <p className="text-[12px] text-muted-foreground">
              {system.notes || "No notes recorded."}
            </p>
          )}
        </Panel>

        <Panel title="Available actions">
          <p className="text-[12px] text-muted-foreground">
            A connector for {provider.label} is expected to provide:
          </p>
          <ul className="mt-3 space-y-2">
            {provider.plannedCapabilities.length === 0 && (
              <li className="text-[12px] text-muted-foreground">
                No connector capabilities defined for this system type.
              </li>
            )}
            {provider.plannedCapabilities.map((capability) => (
              <li
                key={capability}
                className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-[12px]"
              >
                {CAPABILITY_LABELS[capability]}
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {system.capabilities?.includes(capability)
                    ? "Available"
                    : "Unavailable — integration required"}
                </Badge>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Alerts">
          {notifications.filter((n) => n.system_id === systemId).length === 0 ? (
            <EmptyState>No alerts recorded for this system.</EmptyState>
          ) : (
            <ul className="divide-y">
              {notifications
                .filter((n) => n.system_id === systemId)
                .map((alert) => (
                  <li key={alert.id} className="flex items-start gap-2 py-2 text-[12px]">
                    <span
                      className={`mt-1.5 size-1.5 shrink-0 rounded-full ${severityDotClass(alert.severity)}`}
                    />
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-muted-foreground">{timeAgo(alert.created_at)}</p>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent activity">
          {activity.filter((a) => a.system_id === systemId).length === 0 ? (
            <EmptyState>No activity yet.</EmptyState>
          ) : (
            <ul className="divide-y">
              {activity
                .filter((a) => a.system_id === systemId)
                .map((event) => (
                  <li key={event.id} className="py-2 text-[12px]">
                    <p className="font-medium">{event.action}</p>
                    <p className="text-muted-foreground">
                      {event.detail} · {timeAgo(event.created_at)}
                    </p>
                  </li>
                ))}
            </ul>
          )}
        </Panel>

        <Panel title="Connections">
          {connections.filter((c) => c.from_system_id === systemId || c.to_system_id === systemId)
            .length === 0 ? (
            <EmptyState>
              Not part of a flow yet.{" "}
              <Link to="/app/flows" className="font-medium text-brand">
                Build one →
              </Link>
            </EmptyState>
          ) : (
            <ul className="space-y-2">
              {connections
                .filter((c) => c.from_system_id === systemId || c.to_system_id === systemId)
                .map((connection) => (
                  <li
                    key={connection.id}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px]"
                  >
                    <span className="truncate">{systemName(connection.from_system_id)}</span>
                    <ArrowRight className="size-3.5 shrink-0 text-brand" />
                    <span className="truncate">{systemName(connection.to_system_id)}</span>
                    {connection.label && (
                      <span className="ml-auto shrink-0 text-muted-foreground">
                        {connection.label}
                      </span>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}
