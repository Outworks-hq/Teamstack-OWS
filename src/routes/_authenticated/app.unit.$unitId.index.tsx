import { Link, createFileRoute } from "@tanstack/react-router";
import { Bell, ChevronRight, FileText, KeyRound, Plus, RotateCw } from "lucide-react";

import { EmptyState } from "@/components/app/AppShell";
import { ProviderMark } from "@/components/brand/ProviderMark";
import { formatMoney, platformUsage, severityDotClass, timeAgo } from "@/lib/ows/model";
import { useUnit, unitStateLabel } from "@/lib/ows/unit";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/unit/$unitId/")({
  component: UnitConsole,
});

/* ------------------------------------------------------------------ pieces */

type UnitTo =
  | "/app/unit/$unitId/systems"
  | "/app/unit/$unitId/alerts"
  | "/app/unit/$unitId/billing"
  | "/app/unit/$unitId/access"
  | "/app/unit/$unitId/actions";

function Card({
  title,
  children,
  linkLabel,
  to,
  unitId,
}: {
  title: string;
  children: React.ReactNode;
  linkLabel: string;
  to: UnitTo;
  unitId: string;
}) {
  return (
    <Link
      to={to}
      params={{ unitId }}
      className="flex flex-col rounded-xl border bg-card p-4 shadow-card transition-colors hover:border-brand/40"
    >
      <p className="text-[13px] font-semibold">{title}</p>
      {children}
      <p className="mt-auto pt-4 text-[12px] font-medium text-brand">
        {linkLabel} <span aria-hidden="true">→</span>
      </p>
    </Link>
  );
}

function Big({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-2xl font-semibold tracking-tight">{children}</p>;
}

/* ----------------------------------------------------------------- console */

function UnitConsole() {
  const { unit, systems, openAlerts, activity, roster, attention, loading } = useUnit();
  const { profileName } = useWorkspace();
  const state = unitStateLabel({ systems, attention });
  const usage = platformUsage(systems);

  const toneDot =
    state.tone === "critical"
      ? "bg-destructive"
      : state.tone === "warning"
        ? "bg-warning"
        : "bg-success";

  const quickActions = [
    { label: "Restart a service", icon: RotateCw },
    { label: "View logs", icon: FileText },
    { label: "Manage access", icon: KeyRound },
    { label: "Record an alert", icon: Bell },
  ];

  return (
    <div className="mx-auto max-w-[1240px]">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold tracking-tight">{unit.name}</h1>
        {unit.purpose && (
          <p className="mt-1.5 max-w-[70ch] text-[13px] text-muted-foreground">{unit.purpose}</p>
        )}
        <p className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px]">
          <span className={`size-1.5 rounded-full ${toneDot}`} />
          {loading ? "Checking this Unit…" : state.label}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        <Card
          title="Connected systems"
          linkLabel="View all systems"
          to="/app/unit/$unitId/systems"
          unitId={unit.id}
        >
          <Big>{systems.length}</Big>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span
              className={`size-1.5 rounded-full ${attention.systems.length > 0 ? "bg-warning" : "bg-success"}`}
            />
            {attention.systems.length > 0
              ? `${attention.systems.length} need a look`
              : "All healthy"}
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {systems.slice(0, 8).map((system) => (
              <ProviderMark key={system.id} providerId={system.provider} />
            ))}
          </div>
        </Card>

        <Card
          title="Alerts"
          linkLabel="View all alerts"
          to="/app/unit/$unitId/alerts"
          unitId={unit.id}
        >
          <Big>{openAlerts.length}</Big>
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
        </Card>

        <Card
          title="Usage"
          linkLabel="View usage"
          to="/app/unit/$unitId/billing"
          unitId={unit.id}
        >
          <Big>{usage.reported > 0 ? formatMoney(usage.total) : "—"}</Big>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {usage.reported > 0
              ? `this month, from ${usage.reported} connected ${usage.reported === 1 ? "platform" : "platforms"}`
              : "No platform usage reported yet"}
          </p>
          <ul className="mt-3 space-y-1.5">
            {usage.items
              .filter((item) => item.cents !== null)
              .slice(0, 4)
              .map((item) => (
                <li key={item.systemId} className="flex items-center gap-2 text-[12px]">
                  <span className="truncate text-muted-foreground">{item.name}</span>
                  <span className="ml-auto shrink-0 font-medium">
                    {formatMoney(item.cents ?? 0)}
                  </span>
                </li>
              ))}
          </ul>
        </Card>

        <Card
          title="Access"
          linkLabel="Manage access"
          to="/app/unit/$unitId/access"
          unitId={unit.id}
        >
          <Big>{roster.length}</Big>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-success" /> People in this Unit
          </p>
        </Card>

        <Card
          title="Actions"
          linkLabel="See all actions"
          to="/app/unit/$unitId/actions"
          unitId={unit.id}
        >
          <ul className="mt-3 space-y-2">
            {quickActions.map((action) => (
              <li
                key={action.label}
                className="flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[12px]"
              >
                <action.icon className="size-3.5 text-brand" />
                {action.label}
                <ChevronRight className="ml-auto size-3.5 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <section className="mt-4 rounded-xl border bg-card p-4 shadow-card">
        <p className="text-[13px] font-semibold">Recent activity</p>
        {activity.length === 0 ? (
          <p className="mt-3 text-[12px] text-muted-foreground">Nothing has happened yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {activity.slice(0, 5).map((event) => (
              <li key={event.id} className="text-[12px]">
                <p className="truncate">{event.detail ?? event.action}</p>
                <p className="mt-0.5 text-muted-foreground">
                  {profileName(event.actor_id)} · {timeAgo(event.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/app/unit/$unitId/control-room"
          params={{ unitId: unit.id }}
          className="mt-4 inline-block text-[12px] font-medium text-brand"
        >
          Open Control Room <span aria-hidden="true">→</span>
        </Link>
      </section>

      {systems.length === 0 && (
        <div className="mt-8">
          <EmptyState>
            Nothing is connected to {unit.name} yet.{" "}
            <Link
              to="/app/unit/$unitId/systems"
              params={{ unitId: unit.id }}
              className="font-medium text-brand"
            >
              <Plus className="inline size-3.5" /> Connect the first system
            </Link>
          </EmptyState>
        </div>
      )}
    </div>
  );
}
