import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

import { UnitShell, WorkspaceShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { UnitProvider } from "@/lib/ows/unit";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/unit/$unitId")({
  component: UnitRoom,
});

function UnitRoom() {
  const { unitId } = Route.useParams();
  const { units, loading } = useWorkspace();
  const unit = units.find((u) => u.id === unitId) ?? null;

  if (!unit) {
    if (loading || units.length === 0) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-muted-foreground">
          Opening Unit…
        </div>
      );
    }
    return (
      <WorkspaceShell>
        <div className="mx-auto max-w-md py-16 text-center">
          <h1 className="text-xl font-semibold tracking-tight">Unit not available</h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            This Unit does not exist in the current organization, or you do not have access to it.
          </p>
          <Button asChild className="mt-6">
            <Link to="/app/workspace">Back to all Units</Link>
          </Button>
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <UnitProvider unit={unit}>
      <UnitShell unit={unit}>
        <Outlet />
      </UnitShell>
    </UnitProvider>
  );
}
