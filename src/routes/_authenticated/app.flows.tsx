import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader, Panel } from "@/components/app/AppShell";
import { ProviderMark } from "@/components/brand/ProviderMark";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as data from "@/lib/ows/data";
import type { Flow, SystemConnection, SystemRecord } from "@/lib/ows/model";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/flows")({
  component: FlowsPage,
});

function FlowsPage() {
  const { workspace, units, isWorkspaceAdmin, canManageUnit } = useWorkspace();
  const workspaceId = workspace!.id;

  const flows =
    useQuery({ queryKey: ["flows", workspaceId], queryFn: () => data.listFlows(workspaceId) })
      .data ?? [];
  const systems =
    useQuery({ queryKey: ["systems", workspaceId], queryFn: () => data.listSystems(workspaceId) })
      .data ?? [];
  const connections =
    useQuery({
      queryKey: ["connections", workspaceId],
      queryFn: () => data.listConnections(workspaceId),
    }).data ?? [];

  const canCreate = isWorkspaceAdmin || units.some((u) => canManageUnit(u.id));

  return (
    <>
      <PageHeader
        title="Connected Operations"
        description="Map how your systems actually work together — Ads → Website → CRM → Email → Stripe → Customer access. Build flows manually now; connectors can automate discovery later."
        action={canCreate ? <CreateFlowDialog /> : undefined}
      />

      {flows.length === 0 ? (
        <EmptyState>
          No operational flows yet. Create one to show the direction information moves between your
          systems.
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {flows.map((flow) => (
            <FlowPanel
              key={flow.id}
              flow={flow}
              systems={systems}
              connections={connections.filter((c) => c.flow_id === flow.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function FlowPanel({
  flow,
  systems,
  connections,
}: {
  flow: Flow;
  systems: SystemRecord[];
  connections: SystemConnection[];
}) {
  const { units, canManageUnit } = useWorkspace();
  const queryClient = useQueryClient();
  const manage = canManageUnit(flow.unit_id);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [label, setLabel] = useState("");

  const system = (id: string) => systems.find((s) => s.id === id);

  async function run(fn: () => Promise<unknown>, message: string) {
    try {
      await fn();
      toast.success(message);
      void queryClient.invalidateQueries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    }
  }

  return (
    <Panel>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold">{flow.name}</h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {[flow.description, units.find((u) => u.id === flow.unit_id)?.name]
              .filter(Boolean)
              .join(" · ") || "Workspace-wide flow"}
          </p>
        </div>
        {manage && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => void run(() => data.deleteFlow(flow.id), "Flow deleted")}
          >
            <Trash2 className="size-3.5" /> Delete
          </Button>
        )}
      </div>

      {connections.length === 0 ? (
        <p className="mt-4 text-[12px] text-muted-foreground">
          No connections yet — add the first step below.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {connections.map((connection) => {
            const fromSystem = system(connection.from_system_id);
            const toSystem = system(connection.to_system_id);
            return (
              <li
                key={connection.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted/30 px-3 py-2.5"
              >
                <FlowNode system={fromSystem} />
                <div className="flex items-center gap-1.5 text-[11px] text-brand">
                  <ArrowRight className="size-4" />
                  {connection.label && <span>{connection.label}</span>}
                </div>
                <FlowNode system={toSystem} />
                {manage && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-auto"
                    onClick={() =>
                      void run(() => data.deleteConnection(connection.id), "Connection removed")
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {manage && (
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <div className="space-y-1.5">
            <Label className="text-[11px]">From</Label>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger className="h-8 w-[180px] text-[12px]">
                <SelectValue placeholder="System" />
              </SelectTrigger>
              <SelectContent>
                {systems.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">To</Label>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger className="h-8 w-[180px] text-[12px]">
                <SelectValue placeholder="System" />
              </SelectTrigger>
              <SelectContent>
                {systems.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Relationship</Label>
            <Input
              className="h-8 w-[200px] text-[12px]"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="sends leads to"
            />
          </div>
          <Button
            size="sm"
            disabled={!from || !to || from === to}
            onClick={() => {
              const payload = {
                workspace_id: flow.workspace_id,
                flow_id: flow.id,
                from_system_id: from,
                to_system_id: to,
                label: label || null,
                position: connections.length,
              };
              setFrom("");
              setTo("");
              setLabel("");
              void run(() => data.createConnection(payload), "Connection added");
            }}
          >
            Connect
          </Button>
        </div>
      )}
    </Panel>
  );
}

function FlowNode({ system }: { system: SystemRecord | undefined }) {
  if (!system) return <span className="text-[12px] text-muted-foreground">Unknown system</span>;
  return (
    <Link
      to="/app/systems/$systemId"
      params={{ systemId: system.id }}
      className="flex items-center gap-2 rounded-lg border bg-card px-2.5 py-1.5 text-[12px] font-medium transition-colors hover:border-brand"
    >
      <ProviderMark providerId={system.provider} className="size-5 rounded-md text-[9px]" />
      {system.name}
    </Link>
  );
}

function CreateFlowDialog() {
  const { workspace, units, userId, canManageUnit } = useWorkspace();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", unit_id: "" });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const flow = await data.createFlow({
        workspace_id: workspace!.id,
        unit_id: form.unit_id || null,
        name: form.name.trim(),
        description: form.description || null,
      });
      await data.logActivity({
        workspace_id: workspace!.id,
        unit_id: flow.unit_id,
        actor_id: userId,
        action: "Flow created",
        detail: flow.name,
      });
      toast.success("Flow created");
      setOpen(false);
      setForm({ name: "", description: "", unit_id: "" });
      void queryClient.invalidateQueries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create flow");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> New flow
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New operational flow</DialogTitle>
          <DialogDescription>
            Name the operation, then connect the systems it moves through.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="flow-name">Flow name</Label>
            <Input
              id="flow-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Acquisition to customer access"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="flow-desc">Description</Label>
            <Input
              id="flow-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Unit</Label>
            <Select value={form.unit_id} onValueChange={(unit_id) => setForm({ ...form, unit_id })}>
              <SelectTrigger>
                <SelectValue placeholder="Workspace-wide" />
              </SelectTrigger>
              <SelectContent>
                {units
                  .filter((unit) => canManageUnit(unit.id))
                  .map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Create flow</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
