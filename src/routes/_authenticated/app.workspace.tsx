import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeftRight, Building2, Plus, Users } from "lucide-react";

import { EmptyState, PageHeader, Panel, WorkspaceShell } from "@/components/app/AppShell";
import { ProviderMark } from "@/components/brand/ProviderMark";
import { Button } from "@/components/ui/button";
import { useUnitDirectory } from "@/lib/ows/directory";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/workspace")({
  component: WorkspaceHome,
});

function WorkspaceHome() {
  const { workspace, workspaces, units, members, isWorkspaceAdmin } = useWorkspace();
  const directory = useUnitDirectory();

  return (
    <WorkspaceShell>
      <PageHeader
        title={workspace?.name ?? "Workspace"}
        description="This is your organization. Choose a Unit below to enter its operating room — each Unit has its own systems, alerts, people and usage."
        action={
          <div className="flex items-center gap-2">
            {workspaces.length > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link to="/app/workspaces">
                  <ArrowLeftRight className="size-4" /> Switch workspace
                </Link>
              </Button>
            )}
            {isWorkspaceAdmin && (
              <Button asChild size="sm">
                <Link to="/app/units">
                  <Plus className="size-4" /> New Unit
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <h2 className="mb-4 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
        Your Units
      </h2>

      {units.length === 0 ? (
        <EmptyState>
          No Units yet. Units are the operating spaces inside this organization — create your first
          one to get started.
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {units.map((unit) => {
            const info = directory[unit.id];
            const tone =
              info?.state.tone === "critical"
                ? "bg-destructive"
                : info?.state.tone === "warning"
                  ? "bg-warning"
                  : "bg-success";

            return (
              <Link
                key={unit.id}
                to="/app/unit/$unitId"
                params={{ unitId: unit.id }}
                className="group flex flex-col rounded-xl border bg-card p-5 shadow-card transition-colors hover:border-brand/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[15px] font-semibold tracking-tight group-hover:text-brand">
                    {unit.name}
                  </p>
                  {unit.status !== "open" && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                      Closed
                    </span>
                  )}
                </div>
                {unit.purpose && (
                  <p className="mt-1.5 line-clamp-2 text-[13px] text-muted-foreground">
                    {unit.purpose}
                  </p>
                )}

                <p className="mt-4 flex items-center gap-2 text-[12px] text-muted-foreground">
                  <span className={`size-1.5 rounded-full ${tone}`} />
                  {info?.state.label ?? "Loading…"}
                </p>

                <div className="mt-4 flex min-h-8 flex-wrap gap-2">
                  {(info?.providers ?? []).slice(0, 6).map((providerId, index) => (
                    <ProviderMark key={`${providerId}-${index}`} providerId={providerId} />
                  ))}
                </div>

                <dl className="mt-5 grid grid-cols-3 gap-2 border-t pt-4 text-[12px]">
                  <div>
                    <dt className="text-muted-foreground">Systems</dt>
                    <dd className="mt-0.5 font-medium">{info?.systemCount ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Needs attention</dt>
                    <dd className="mt-0.5 font-medium">{info?.attentionCount ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">People</dt>
                    <dd className="mt-0.5 font-medium">{info?.memberCount ?? 0}</dd>
                  </div>
                </dl>

                <p className="mt-4 text-[12px] font-medium text-brand">
                  Enter Unit <span aria-hidden="true">→</span>
                </p>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Panel title="Organization settings">
          <p className="text-[13px] text-muted-foreground">
            Create, rename and configure the Units inside {workspace?.name ?? "this workspace"}.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/app/units">
              <Building2 className="size-4" /> Manage Units
            </Link>
          </Button>
        </Panel>
        <Panel title="People">
          <p className="text-[13px] text-muted-foreground">
            {members.length} {members.length === 1 ? "person" : "people"} belong to this
            organization. Invite people and set their organization role.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/app/members">
              <Users className="size-4" /> Manage people
            </Link>
          </Button>
        </Panel>
        <Panel title="Central billing">
          <p className="text-[13px] text-muted-foreground">
            See what the organization pays centrally and what each Unit pays for itself.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/app/billing">Organization billing</Link>
          </Button>
        </Panel>
      </div>
    </WorkspaceShell>
  );
}
