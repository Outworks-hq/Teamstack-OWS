import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, Check, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader, WorkspaceShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkspace } from "@/lib/ows/data";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/workspaces")({
  component: AllWorkspaces,
});

function AllWorkspaces() {
  const { workspaces, workspace, setWorkspaceId, setUnitId, refresh } = useWorkspace();
  const navigate = useNavigate();

  function enter(id: string) {
    setWorkspaceId(id);
    setUnitId(null);
    void navigate({ to: "/app/workspace" });
  }

  return (
    <WorkspaceShell>
      <PageHeader
        title="Your organizations"
        description="Each organization is a separate Workspace with its own Units, people, systems and billing. Choose one to enter."
        action={<NewWorkspace onCreated={(id) => enter(id)} onRefresh={refresh} />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workspaces.map((ws) => {
          const current = ws.id === workspace?.id;
          return (
            <button
              key={ws.id}
              onClick={() => enter(ws.id)}
              className="flex items-start gap-3 rounded-xl border bg-card p-5 text-left shadow-card transition-colors hover:border-brand/40"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft">
                <Building2 className="size-4 text-brand" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[15px] font-semibold tracking-tight">
                    {ws.name}
                  </span>
                  {current && <Check className="size-4 shrink-0 text-brand" />}
                </span>
                <span className="mt-1 block text-[12px] text-muted-foreground">
                  {current ? "You are here" : "Enter this organization"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </WorkspaceShell>
  );
}

function NewWorkspace({
  onCreated,
  onRefresh,
}: {
  onCreated: (id: string) => void;
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const id = await createWorkspace(name.trim());
      onRefresh();
      setOpen(false);
      setName("");
      toast.success("Workspace created");
      onCreated(id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create workspace");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" /> New organization
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ws-name">Organization name</Label>
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Inc."
              required
            />
          </div>
          <Button type="submit" disabled={busy || name.trim().length === 0}>
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
