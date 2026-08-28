import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { EmptyState, PageHeader, Panel } from "@/components/app/AppShell";
import { ProviderMark } from "@/components/brand/ProviderMark";
import { getProvider } from "@/lib/ows/providers";
import { useUnit } from "@/lib/ows/unit";

export const Route = createFileRoute("/_authenticated/app/unit/$unitId/flows")({
  component: UnitFlows,
});

function UnitFlows() {
  const { unit, flows, connections, systems } = useUnit();

  function systemOf(id: string | null) {
    return systems.find((s) => s.id === id) ?? null;
  }

  return (
    <div>
      <PageHeader
        title="Connected Operations"
        description={`How ${unit.name}'s platforms pass information to one another, in plain language.`}
      />

      {flows.length === 0 ? (
        <Panel title="No connected operations yet">
          <EmptyState>
            Once this Unit's systems start passing information between one another, those journeys
            appear here as simple step-by-step paths.
          </EmptyState>
        </Panel>
      ) : (
        <div className="space-y-4">
          {flows.map((flow) => {
            const steps = connections
              .filter((c) => c.flow_id === flow.id)
              .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
            return (
              <Panel key={flow.id} title={flow.name}>
                {flow.description && (
                  <p className="-mt-1 mb-4 text-[13px] text-muted-foreground">{flow.description}</p>
                )}
                {steps.length === 0 ? (
                  <EmptyState>No steps described yet.</EmptyState>
                ) : (
                  <ol className="space-y-3">
                    {steps.map((step, index) => {
                      const from = systemOf(step.from_system_id);
                      const to = systemOf(step.to_system_id);
                      return (
                        <li
                          key={step.id}
                          className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted/20 p-4"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background text-[11px] font-medium text-muted-foreground">
                            {index + 1}
                          </span>
                          <span className="flex items-center gap-2 text-[13px] font-medium">
                            {from && <ProviderMark providerId={from.provider} className="size-6 rounded-md text-[10px]" />}
                            {from?.name ?? "Something outside OWS"}
                          </span>
                          <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
                            <ArrowRight className="size-3.5" />
                            {step.label ?? "sends information to"}
                          </span>
                          <span className="flex items-center gap-2 text-[13px] font-medium">
                            {to && <ProviderMark providerId={to.provider} className="size-6 rounded-md text-[10px]" />}
                            {to?.name ?? "Somewhere outside OWS"}
                          </span>
                          {from && (
                            <span className="ml-auto text-[11px] text-muted-foreground">
                              {getProvider(from.provider).label}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                )}
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
