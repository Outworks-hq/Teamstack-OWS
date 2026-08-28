import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader, Panel } from "@/components/app/AppShell";
import { ProviderMark } from "@/components/brand/ProviderMark";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import * as data from "@/lib/ows/data";
import { SYSTEM_STATUSES, statusDotClass } from "@/lib/ows/model";
import { PROVIDERS, getProvider } from "@/lib/ows/providers";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/systems")({
  component: SystemsPage,
});

function SystemsPage() {
  const { workspace, units, isWorkspaceAdmin, canManageUnit } = useWorkspace();
  const workspaceId = workspace!.id;
  const [unitFilter, setUnitFilter] = useState("all");

  const systems =
    useQuery({ queryKey: ["systems", workspaceId], queryFn: () => data.listSystems(workspaceId) })
      .data ?? [];

  const visible = unitFilter === "all" ? systems : systems.filter((s) => s.unit_id === unitFilter);
  const canAdd = isWorkspaceAdmin || units.some((u) => canManageUnit(u.id));

  return (
    <>
      <PageHeader
        title="Systems"
        description="Every external platform your organization runs, organized by Unit. Systems without a live connector are still fully organized here and open in their own dashboard."
        action={
          <div className="flex items-center gap-2">
            <Select value={unitFilter} onValueChange={setUnitFilter}>
              <SelectTrigger className="w-[200px]">
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
            {canAdd && <AddSystemDialog />}
          </div>
        }
      />

      {units.length === 0 && (
        <Panel className="mb-4">
          <p className="text-[13px] text-muted-foreground">
            Create a Unit first — systems belong to a Unit so responsibility, permissions and
            billing stay clear.{" "}
            <Link to="/app/units" className="font-medium text-brand">
              Go to Units →
            </Link>
          </p>
        </Panel>
      )}

      {visible.length === 0 ? (
        <EmptyState>No systems in this scope yet.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((system) => {
            const provider = getProvider(system.provider);
            return (
              <Panel key={system.id}>
                <div className="flex items-start gap-3">
                  <ProviderMark providerId={system.provider} />
                  <div className="min-w-0">
                    <Link
                      to="/app/systems/$systemId"
                      params={{ systemId: system.id }}
                      className="text-[14px] font-semibold hover:text-brand"
                    >
                      {system.name}
                    </Link>
                    <p className="text-[12px] text-muted-foreground">
                      {system.category || provider.category}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-auto shrink-0 text-[10px] capitalize">
                    <span className={`mr-1 size-1.5 rounded-full ${statusDotClass(system.status)}`} />
                    {system.status}
                  </Badge>
                </div>
                <p className="mt-3 text-[12px] text-muted-foreground">
                  {units.find((u) => u.id === system.unit_id)?.name ?? "Unassigned Unit"}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/app/systems/$systemId" params={{ systemId: system.id }}>
                      Details
                    </Link>
                  </Button>
                  {system.external_url && (
                    <Button asChild size="sm" variant="ghost">
                      <a href={system.external_url} target="_blank" rel="noreferrer noopener">
                        Open platform <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </>
  );
}

function AddSystemDialog() {
  const { workspace, units, userId, canManageUnit, members, profileName } = useWorkspace();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const manageableUnits = units.filter((u) => canManageUnit(u.id));
  const [form, setForm] = useState({
    provider: "github",
    name: "",
    unit_id: manageableUnits[0]?.id ?? "",
    category: "",
    external_url: "",
    notes: "",
    status: "unknown",
    responsible_user_id: "",
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const provider = getProvider(form.provider);
      const system = await data.createSystem({
        workspace_id: workspace!.id,
        unit_id: form.unit_id || null,
        provider: form.provider,
        name: form.name.trim() || provider.label,
        category: form.category || provider.category,
        external_url: form.external_url || provider.docsUrl || null,
        notes: form.notes || null,
        status: form.status,
        responsible_user_id: form.responsible_user_id || null,
        created_by: userId,
      });
      await data.logActivity({
        workspace_id: workspace!.id,
        unit_id: system.unit_id,
        system_id: system.id,
        actor_id: userId,
        action: "System added",
        detail: `${system.name} (${provider.label})`,
      });
      toast.success("System added");
      setOpen(false);
      setForm({ ...form, name: "", external_url: "", notes: "" });
      void queryClient.invalidateQueries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add system");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Add system
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a system</DialogTitle>
          <DialogDescription>
            Record the platform, who owns it, and where it lives. Real API connectors can enhance
            this record later without re-entering anything.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select
                value={form.provider}
                onValueChange={(provider) => setForm({ ...form, provider })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sys-name">Name</Label>
              <Input
                id="sys-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={getProvider(form.provider).label}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Select
                value={form.unit_id}
                onValueChange={(unit_id) => setForm({ ...form, unit_id })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
                <SelectContent>
                  {manageableUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(status) => setForm({ ...form, status })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SYSTEM_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sys-cat">Category</Label>
              <Input
                id="sys-cat"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder={getProvider(form.provider).category}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Responsible member</Label>
              <Select
                value={form.responsible_user_id}
                onValueChange={(responsible_user_id) => setForm({ ...form, responsible_user_id })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {profileName(member.user_id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sys-url">External dashboard URL</Label>
            <Input
              id="sys-url"
              value={form.external_url}
              onChange={(e) => setForm({ ...form, external_url: e.target.value })}
              placeholder={getProvider(form.provider).docsUrl || "https://"}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sys-notes">Notes</Label>
            <Textarea
              id="sys-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!form.unit_id}>
              Add system
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
