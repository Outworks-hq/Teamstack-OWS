import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ShieldCheck } from "lucide-react";

import { EmptyState, PageHeader, Panel } from "@/components/app/AppShell";
import { ProviderMark } from "@/components/brand/ProviderMark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SYSTEM_STATUSES, severityDotClass, statusDotClass, timeAgo } from "@/lib/ows/model";
import { CAPABILITY_LABELS, getProvider } from "@/lib/ows/providers";
import { useUnit } from "@/lib/ows/unit";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/unit/$unitId/control-room")({
  component: UnitControlRoom,
});

function statusLabel(status: string): string {
  return SYSTEM_STATUSES.find((s) => s.value === status)?.label ?? status;
}

function UnitControlRoom() {
  const { unit, systems, alerts, activity, attention } = useUnit();
  const { profileName } = useWorkspace();

  const critical = alerts.filter((a) => a.severity === "critical");
  const warnings = alerts.filter((a) => a.severity === "warning");
  const recovered = alerts.filter((a) => a.severity === "resolved");
  const healthy = systems.filter((s) => s.status === "healthy");

  return (
    <div>
      <PageHeader
        title="Control Room"
        description={`Deeper operational detail for ${unit.name}: system health, incidents, recovery and the full history behind the Console.`}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Systems healthy", value: `${healthy.length}/${systems.length}` },
          { label: "Open incidents", value: critical.length },
          { label: "Warnings", value: warnings.length },
          { label: "Recovered", value: recovered.length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-[12px] text-muted-foreground">{stat.label}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="System health" className="lg:col-span-2">
          {systems.length === 0 ? (
            <EmptyState>No systems connected to this Unit.</EmptyState>
          ) : (
            <ul className="divide-y">
              {systems.map((system) => {
                const provider = getProvider(system.provider);
                return (
                  <li key={system.id} className="flex items-center gap-3 py-3 first:pt-0">
                    <ProviderMark providerId={system.provider} />
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/app/unit/$unitId/systems/$systemId"
                        params={{ unitId: unit.id, systemId: system.id }}
                        className="truncate text-[13px] font-medium hover:text-brand"
                      >
                        {system.name}
                      </Link>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {provider.label} · responsible {profileName(system.responsible_user_id)}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-2 text-[12px] text-muted-foreground">
                      <span className={`size-1.5 rounded-full ${statusDotClass(system.status)}`} />
                      {statusLabel(system.status)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Incidents">
          {critical.length === 0 ? (
            <div className="flex items-start gap-2.5 rounded-lg border border-dashed p-4">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
              <p className="text-[13px] text-muted-foreground">
                No open incidents in this Unit right now.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {critical.map((incident) => (
                <li key={incident.id} className="rounded-lg border border-destructive/30 p-3.5">
                  <p className="flex items-center gap-2 text-[13px] font-medium">
                    <AlertTriangle className="size-3.5 text-destructive" />
                    {incident.title}
                  </p>
                  {incident.body && (
                    <p className="mt-1 text-[12px] text-muted-foreground">{incident.body}</p>
                  )}
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {systems.find((s) => s.id === incident.system_id)?.name ?? "No system"} ·{" "}
                    {timeAgo(incident.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/app/unit/$unitId/alerts" params={{ unitId: unit.id }}>
              All alerts
            </Link>
          </Button>
        </Panel>

        <Panel title="Needs attention">
          {attention.systems.length === 0 && warnings.length === 0 ? (
            <EmptyState>Everything is behaving normally.</EmptyState>
          ) : (
            <ul className="space-y-2.5 text-[13px]">
              {attention.systems.map((system) => (
                <li key={system.id} className="flex items-center gap-2">
                  <span className={`size-1.5 shrink-0 rounded-full ${statusDotClass(system.status)}`} />
                  <span className="truncate">{system.name}</span>
                  <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                    {statusLabel(system.status)}
                  </span>
                </li>
              ))}
              {warnings.map((warning) => (
                <li key={warning.id} className="flex items-center gap-2">
                  <span className={`size-1.5 shrink-0 rounded-full ${severityDotClass(warning.severity)}`} />
                  <span className="truncate">{warning.title}</span>
                  <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                    {timeAgo(warning.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recovery history">
          {recovered.length === 0 ? (
            <EmptyState>Nothing has been recovered yet.</EmptyState>
          ) : (
            <ul className="space-y-2.5 text-[13px]">
              {recovered.map((item) => (
                <li key={item.id}>
                  <p className="truncate">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    resolved {item.resolved_at ? timeAgo(item.resolved_at) : timeAgo(item.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Full history">
          {activity.length === 0 ? (
            <EmptyState>No recorded history for this Unit.</EmptyState>
          ) : (
            <ul className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {activity.map((event) => (
                <li key={event.id} className="text-[12px]">
                  <p>{event.detail ?? event.action}</p>
                  <p className="text-muted-foreground">
                    {profileName(event.actor_id)} · {event.action} · {timeAgo(event.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="What OWS can read" className="lg:col-span-3">
          <p className="text-[13px] text-muted-foreground">
            Live connectors are being rolled out platform by platform. Until a platform has one, its
            information in OWS is whatever this Unit records manually.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {systems.map((system) => {
              const provider = getProvider(system.provider);
              return (
                <div key={system.id} className="rounded-lg border p-3.5">
                  <p className="flex items-center gap-2 text-[13px] font-medium">
                    <ProviderMark providerId={system.provider} className="size-6 rounded-md text-[10px]" />
                    {provider.label}
                  </p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {system.integration_status === "connected"
                      ? "Live connector active"
                      : "Manual tracking — connector planned"}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {provider.plannedCapabilities.slice(0, 4).map((capability) => (
                      <Badge key={capability} variant="secondary" className="text-[10px]">
                        {CAPABILITY_LABELS[capability]}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
