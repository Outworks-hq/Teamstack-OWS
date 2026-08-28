import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { Wordmark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkspace } from "@/lib/ows/data";
import { DEMO_USER, isDemoMode } from "@/lib/ows/demo";
import { WorkspaceProvider, useAuthUser, useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppLayout,
});

function AppLayout() {
  const auth = useAuthUser();
  const demoMode = isDemoMode();
  const loading = demoMode ? false : auth.loading;
  const userId = demoMode ? DEMO_USER.id : auth.userId;
  const email = demoMode ? DEMO_USER.email : auth.email;

  if (loading || !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  return (
    <WorkspaceProvider userId={userId} userEmail={email}>
      <WorkspaceGate />
    </WorkspaceProvider>
  );
}

function WorkspaceGate() {
  const { workspace, loading } = useWorkspace();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  if (!workspace) return <CreateFirstWorkspace />;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function CreateFirstWorkspace() {
  const { refresh, setWorkspaceId } = useWorkspace();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const id = await createWorkspace(name.trim());
      setWorkspaceId(id);
      refresh();
      toast.success("Workspace created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create workspace");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-[440px] rounded-2xl border bg-background p-8 shadow-card">
        <Wordmark />
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">Create your Workspace</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          A Workspace represents one organization. You become its owner and can create Units,
          invite members, and connect systems. You can belong to several Workspaces, and each one
          operates independently.
        </p>
        <form onSubmit={onCreate} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ws">Organization name</Label>
            <Input
              id="ws"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Inc."
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy || name.trim().length === 0}>
            Create Workspace
          </Button>
        </form>
      </div>
    </main>
  );
}
