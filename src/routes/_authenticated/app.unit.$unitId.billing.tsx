import { Link, createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { EmptyState, PageHeader, Panel } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { ProviderMark } from "@/components/brand/ProviderMark";
import { formatMoney, platformUsage } from "@/lib/ows/model";
import { useUnit } from "@/lib/ows/unit";

export const Route = createFileRoute("/_authenticated/app/unit/$unitId/billing")({
  component: UnitUsage,
});

function UnitUsage() {
  const { unit, systems } = useUnit();
  const usage = platformUsage(systems);

  return (
    <div className="mx-auto max-w-[1240px]">
      <PageHeader
        title="Usage"
        description={`What the platforms connected to ${unit.name} are using and costing this month. Organization-wide billing lives under Workspace billing.`}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="This month">
          <p className="text-2xl font-semibold tracking-tight">
            {usage.reported > 0 ? formatMoney(usage.total) : "—"}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            across {usage.reported} connected {usage.reported === 1 ? "platform" : "platforms"}
          </p>
          <p className="mt-4 text-[13px] text-muted-foreground">
            {systems.length} {systems.length === 1 ? "system is" : "systems are"} connected to this
            Unit.
          </p>
        </Panel>

        <Panel title="By connected platform" className="lg:col-span-2">
          {systems.length === 0 ? (
            <EmptyState>No systems are connected to this Unit yet.</EmptyState>
          ) : (
            <ul className="divide-y">
              {usage.items.map((item) => (
                <li key={item.systemId} className="flex items-center gap-3 py-3 first:pt-0">
                  <ProviderMark providerId={item.provider} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{item.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {item.detail ?? "No usage reported yet"}
                    </p>
                  </div>
                  <span className="w-24 shrink-0 text-right text-[13px]">
                    {item.cents === null ? "—" : formatMoney(item.cents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/app/billing">
              Workspace billing <ExternalLink className="size-3.5" />
            </Link>
          </Button>
        </Panel>
      </div>
    </div>
  );
}
