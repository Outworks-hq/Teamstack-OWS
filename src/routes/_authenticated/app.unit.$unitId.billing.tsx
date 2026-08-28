import { Link, createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { EmptyState, PageHeader, Panel } from "@/components/app/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/ows/model";
import { useUnit } from "@/lib/ows/unit";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/unit/$unitId/billing")({
  component: UnitBilling,
});

function UnitBilling() {
  const { unit, billing, systems } = useUnit();
  const { workspace, profileName } = useWorkspace();

  const central = workspace?.billing_mode === "central";
  const total = billing.reduce((sum, record) => sum + record.amount_cents, 0);

  return (
    <div>
      <PageHeader
        title="Usage & billing"
        description={
          central
            ? `${workspace?.name} pays centrally for every Unit. This is what ${unit.name} uses.`
            : `${unit.name} is billed on its own.`
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="This Unit">
          <p className="text-2xl font-semibold tracking-tight">{formatMoney(total)}</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            across {billing.length} {billing.length === 1 ? "record" : "records"}
          </p>
          <p className="mt-4 text-[13px] text-muted-foreground">
            {systems.length} connected {systems.length === 1 ? "system" : "systems"} in this Unit.
          </p>
        </Panel>

        <Panel title="Records" className="lg:col-span-2">
          {billing.length === 0 ? (
            <EmptyState>No usage recorded for this Unit yet.</EmptyState>
          ) : (
            <ul className="divide-y">
              {billing.map((record) => (
                <li key={record.id} className="flex items-center gap-3 py-3 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium">
                      {new Date(record.period_start).toLocaleDateString(undefined, {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      paid by {central ? workspace?.name : profileName(record.payer_user_id)}
                    </p>
                  </div>
                  <Badge variant={record.status === "paid" ? "secondary" : "outline"}>
                    {record.status}
                  </Badge>
                  <span className="w-24 shrink-0 text-right text-[13px]">
                    {formatMoney(record.amount_cents, record.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/app/billing">
              Organization billing <ExternalLink className="size-3.5" />
            </Link>
          </Button>
        </Panel>
      </div>
    </div>
  );
}
