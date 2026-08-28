import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight, ExternalLink } from "lucide-react";

import { EmptyState, Panel } from "@/components/app/AppShell";
import { ProviderMark } from "@/components/brand/ProviderMark";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import * as data from "@/lib/ows/data";
import {
  formatMoney,
  severityDotClass,
  statusDotClass,
  timeAgo,
  roleLabel,
} from "@/lib/ows/model";
import { getProvider } from "@/lib/ows/providers";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/console")({
  component: ConsolePage,
});

function ConsolePage() {
  const { workspace, units, members, profileName } = useWorkspace();
  const workspaceId = workspace!.id;
  const [unitFilter, setUnitFilter] = useState<string>("all");

  const systems = useQuery({
    queryKey: ["systems", workspaceId],
    queryFn: () => data.listSystems(workspaceId),
  }).data ?? [];
  const notifications =
    useQuery({
      queryKey: ["notifications", workspaceId],
      queryFn: () => data.listNotifications(workspaceId),
    }).data ?? [];
  const billing =
    useQuery({ queryKey: ["billing", workspaceId], queryFn: () => data.listBilling(workspaceId) })
      .data ?? [];
  const activity =
    useQuery({ queryKey: ["activity", workspaceId], queryFn: () => data.listActivity(workspaceId) })
      .data ?? [];

  const inUnit = <T extends { unit_id: string | null }>(rows: T[]) =>
    unitFilter === "all" ? rows : rows.filter((r) => r.unit_id === unitFilter);

  const scopedSystems = inUnit(systems);
  const openAlerts = inUnit(notifications).filter((n) => n.severity !== "resolved");
  const scopedBilling = inUnit(billing);
  const total = scopedBilling.reduce((sum, r) => sum + Number(r.amount_cents), 0);
  const healthy = scopedSystems.filter((s) => s.status === "healthy").length;

  const roleCounts = members.reduce<Record<string, number>>((acc, m) => {
    acc[m.role] = (acc[m.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Console</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Your day-to-day operations hub for {workspace!.name}.
          </p>
        </div>
        <Select value={unitFilter} onValueChange={setUnitFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Units</SelectItem>
            {units.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Panel title="Connected systems">
          <p className="text-2xl font-semibold tracking-tight">{scopedSystems.length}</p>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span
              className={`size-1.5 rounded-full ${
                scopedSystems.length > 0 && healthy === scopedSystems.length
                  ? "bg-success"
                  : "bg-muted-foreground"
              }`}
            />
            {scopedSystems.length === 0
              ? "No systems yet"
              : `${healthy} of ${scopedSystems.length} healthy`}
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {scopedSystems.slice(0, 8).map((system) => (
              <ProviderMark key={system.id} providerId={system.provider} />
            ))}
          </div>
          <Link to="/app/systems" className="mt-4 block text-[12px] font-medium text-brand">
            View all systems →
          </Link>
        </Panel>

        <Panel title="Alerts">
          <p className="text-2xl font-semibold tracking-tight">{openAlerts.length}</p>
          <ul className="mt-3 space-y-2">
            {openAlerts.slice(0, 3).map((alert) => (
              <li key={alert.id} className="flex items-center gap-2 text-[12px]">
                <span
                  className={`size-1.5 shrink-0 rounded-full ${severityDotClass(alert.severity)}`}
                />
                <span className="truncate">{alert.title}</span>
                <span className="ml-auto shrink-0 text-muted-foreground">
                  {timeAgo(alert.created_at)}
                </span>
              </li>
            ))}
            {openAlerts.length === 0 && (
              <li className="text-[12px] text-muted-foreground">Nothing needs attention.</li>
            )}
          </ul>
          <Link to="/app/notifications" className="mt-4 block text-[12px] font-medium text-brand">
            View all alerts →
          </Link>
        </Panel>

        <Panel title="Billing">
          <p className="text-2xl font-semibold tracking-tight">{formatMoney(total)}</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {scopedBilling.length} recorded {scopedBilling.length === 1 ? "period" : "periods"}
          </p>
          <ul className="mt-3 space-y-1.5">
            {scopedBilling.slice(0, 4).map((record) => (
              <li key={record.id} className="flex items-center justify-between text-[12px]">
                <span className="truncate text-muted-foreground">
                  {units.find((u) => u.id === record.unit_id)?.name ?? "Workspace"}
                </span>
                <span className="font-medium">{formatMoney(Number(record.amount_cents))}</span>
              </li>
            ))}
          </ul>
          <Link to="/app/billing" className="mt-4 block text-[12px] font-medium text-brand">
            View billing →
          </Link>
        </Panel>

        <Panel title="Access">
          <p className="text-2xl font-semibold tracking-tight">{members.length}</p>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-success" /> Active members
          </p>
          <dl className="mt-3 space-y-1.5">
            {Object.entries(roleCounts).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between text-[12px]">
                <dt className="text-muted-foreground">{roleLabel(role)}</dt>
                <dd className="font-medium">{count}</dd>
              </div>
            ))}
          </dl>
          <Link to="/app/members" className="mt-4 block text-[12px] font-medium text-brand">
            Manage access →
          </Link>
        </Panel>

        <Panel title="Actions">
          <ul className="space-y-2">
            {scopedSystems.slice(0, 4).map((system) => {
              const provider = getProvider(system.provider);
              return (
                <li key={system.id}>
                  <a
                    href={system.external_url ?? provider.docsUrl || "#"}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[12px] hover:bg-accent"
                  >
                    <ProviderMark providerId={system.provider} className="size-5 rounded-md text-[9px]" />
                    <span className="truncate">Open {system.name}</span>
                    <ExternalLink className="ml-auto size-3.5 text-muted-foreground" />
                  </a>
                </li>
              );
            })}
            {scopedSystems.length === 0 && (
              <li className="text-[12px] text-muted-foreground">
                Add a system to unlock actions.
              </li>
            )}
          </ul>
          <Link to="/app/systems" className="mt-4 block text-[12px] font-medium text-brand">
            See all actions →
          </Link>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Recent activity">
          {activity.length === 0 ? (
            <EmptyState>Activity appears here as your team works.</EmptyState>
          ) : (
            <ul className="divide-y">
              {activity.slice(0, 8).map((event) => (
                <li key={event.id} className="flex items-center gap-3 py-2 text-[12px]">
                  <span className="font-medium">{event.action}</span>
                  <span className="truncate text-muted-foreground">{event.detail}</span>
                  <span className="ml-auto shrink-0 text-muted-foreground">
                    {profileName(event.actor_id)} · {timeAgo(event.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Systems by status">
          {scopedSystems.length === 0 ? (
            <EmptyState>No systems recorded in this scope yet.</EmptyState>
          ) : (
            <ul className="divide-y">
              {scopedSystems.slice(0, 8).map((system) => (
                <li key={system.id}>
                  <Link
                    to="/app/systems/$systemId"
                    params={{ systemId: system.id }}
                    className="flex items-center gap-3 py-2 text-[12px] hover:text-brand"
                  >
                    <span className={`size-1.5 rounded-full ${statusDotClass(system.status)}`} />
                    <span className="font-medium">{system.name}</span>
                    <span className="text-muted-foreground">
                      {units.find((u) => u.id === system.unit_id)?.name ?? "Unassigned Unit"}
                    </span>
                    <ChevronRight className="ml-auto size-3.5 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
