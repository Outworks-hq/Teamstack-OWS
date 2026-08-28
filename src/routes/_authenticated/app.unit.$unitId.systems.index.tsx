import { Link, createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight, ExternalLink, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/app/AppShell";
import { ProviderMark } from "@/components/brand/ProviderMark";
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
import { useUnit } from "@/lib/ows/unit";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/unit/$unitId/systems/")({
  component: UnitSystems,
});

function UnitSystems() {
  const { unit, systems, can, isAdmin } = useUnit();
  const { profileName } = useWorkspace();

  return (
    <div>
      <PageHeader
        title="Connected systems"
        description={`The platforms ${unit.name} operates. Open one to see its details, who is responsible and what it is connected to.`}
        action={(isAdmin || can("systems.add")) && <AddSystem />}
      />

      {systems.length === 0 ? (
        <EmptyState>No systems are connected to this Unit yet.</EmptyState>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card shadow-card">
          {systems.map((system) => {
            const provider = getProvider(system.provider);
            const status =
              SYSTEM_STATUSES.find((s) => s.value === system.status)?.label ?? system.status;
            return (
              <li key={system.id}>
                <Link
                  to="/app/unit/$unitId/systems/$systemId"
                  params={{ unitId: unit.id, systemId: system.id }}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-secondary/40"
                >
                  <ProviderMark providerId={system.provider} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">{system.name}</p>
                    <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                      {provider.label} · {system.category ?? provider.category} ·{" "}
                      {system.responsible_user_id
                        ? profileName(system.responsible_user_id)
                        : "No owner set"}
                    </p>
                  </div>
                  <span className="hidden items-center gap-2 text-[12px] text-muted-foreground sm:flex">
                    <span className={`size-1.5 rounded-full ${statusDotClass(system.status)}`} />
                    {status}
                  </span>
                  {system.external_url && (
                    <ExternalLink className="hidden size-3.5 shrink-0 text-muted-foreground md:block" />
                  )}
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function AddSystem() {
  const { unit } = useUnit();
  const { workspace, userId, members, profileName } = useWorkspace();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    provider: "aws",
    name: "",
    external_url: "",
    notes: "",
    status: "healthy",
    responsible_user_id: "",
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const provider = getProvider(form.provider);
      await data.createSystem({
        workspace_id: workspace!.id,
        unit_id: unit.id,
        provider: form.provider,
        name: form.name.trim(),
        category: provider.category,
        external_url: form.external_url.trim() || null,
        notes: form.notes.trim() || null,
        status: form.status,
        responsible_user_id: form.responsible_user_id || null,
        created_by: userId,
      });
      await data.logActivity({
        workspace_id: workspace!.id,
        unit_id: unit.id,
        actor_id: userId,
        action: "system.added",
        detail: `${form.name.trim()} added to ${unit.name}`,
      });
      void queryClient.invalidateQueries();
      setOpen(false);
      setForm({
        provider: "aws",
        name: "",
        external_url: "",
        notes: "",
        status: "healthy",
        responsible_user_id: "",
      });
      toast.success("System connected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add system");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" /> Connect a system
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect a system to {unit.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Platform</Label>
            <Select value={form.provider} onValueChange={(provider) => setForm({ ...form, provider })}>
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
            <Label htmlFor="sys-name">Name in OWS</Label>
            <Input
              id="sys-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="AWS — production account"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sys-url">Link to the platform</Label>
            <Input
              id="sys-url"
              value={form.external_url}
              onChange={(e) => setForm({ ...form, external_url: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Current state</Label>
              <Select value={form.status} onValueChange={(status) => setForm({ ...form, status })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SYSTEM_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Who is responsible?</Label>
              <Select
                value={form.responsible_user_id}
                onValueChange={(responsible_user_id) => setForm({ ...form, responsible_user_id })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
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
            <Label htmlFor="sys-notes">Notes</Label>
            <Textarea
              id="sys-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="What this system does and anything worth knowing."
            />
          </div>
          <Button type="submit" disabled={form.name.trim().length === 0}>
            Connect system
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
