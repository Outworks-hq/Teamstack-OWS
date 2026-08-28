import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader, Panel, WorkspaceShell } from "@/components/app/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  CUSTOM_PERMISSIONS,
  UNIT_FUNCTIONS,
  UNIT_ROLES,
  roleLabel,
  type Unit,
} from "@/lib/ows/model";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/units")({
  component: () => (
    <WorkspaceShell>
      <UnitsPage />
    </WorkspaceShell>
  ),
});

function UnitsPage() {
  const { units, isWorkspaceAdmin } = useWorkspace();

  return (
    <>
      <PageHeader
        title="Units"
        description="Units are fully customizable. Name and configure them around how your organization actually operates — a team, a location, a client, a launch, or a piece of infrastructure."
        action={isWorkspaceAdmin ? <CreateUnitDialog /> : undefined}
      />
      {units.length === 0 ? (
        <EmptyState>No Units yet. Create your first Unit to start organizing systems.</EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {units.map((unit) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      )}
    </>
  );
}

function UnitCard({ unit }: { unit: Unit }) {
  const { members, unitMembers, profileName, canManageUnit, isWorkspaceAdmin, workspace, userId } =
    useWorkspace();
  const queryClient = useQueryClient();
  const manage = canManageUnit(unit.id);
  const roster = unitMembers.filter((m) => m.unit_id === unit.id);
  const [addUser, setAddUser] = useState("");

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
          <h3 className="text-[15px] font-semibold">{unit.name}</h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {unit.purpose || "No purpose described"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            {unit.status === "closed" ? "Closed" : "Open"}
          </Badge>
          {manage && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                void run(
                  () =>
                    data.updateUnit(unit.id, {
                      status: unit.status === "closed" ? "open" : "closed",
                    }),
                  "Unit updated",
                )
              }
            >
              {unit.status === "closed" ? "Open Unit" : "Close Unit"}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Enabled functions
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {UNIT_FUNCTIONS.map((fn) => {
            const on = unit.enabled_functions?.includes(fn.value);
            return manage ? (
              <button
                key={fn.value}
                type="button"
                onClick={() =>
                  void run(
                    () =>
                      data.updateUnit(unit.id, {
                        enabled_functions: on
                          ? (unit.enabled_functions ?? []).filter((v) => v !== fn.value)
                          : [...(unit.enabled_functions ?? []), fn.value],
                      }),
                    "Functions updated",
                  )
                }
                className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                  on ? "border-brand bg-brand-soft text-brand" : "text-muted-foreground"
                }`}
              >
                {fn.label}
              </button>
            ) : (
              <span
                key={fn.value}
                className={`rounded-full border px-2.5 py-1 text-[11px] ${
                  on ? "border-brand bg-brand-soft text-brand" : "text-muted-foreground"
                }`}
              >
                {fn.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Billing responsibility
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
          {manage && isWorkspaceAdmin ? (
            <Select
              value={unit.billing_mode}
              onValueChange={(billing_mode) =>
                void run(() => data.updateUnit(unit.id, { billing_mode }), "Billing mode updated")
              }
            >
              <SelectTrigger className="h-8 w-[190px] text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="central">Central (Workspace pays)</SelectItem>
                <SelectItem value="unit">Unit billing</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="outline" className="text-[10px]">
              {unit.billing_mode === "unit" ? "Unit billing" : "Central billing"}
            </Badge>
          )}
          {manage ? (
            <Select
              value={unit.payer_user_id ?? ""}
              onValueChange={(payer_user_id) =>
                void run(() => data.updateUnit(unit.id, { payer_user_id }), "Payer updated")
              }
            >
              <SelectTrigger className="h-8 w-[190px] text-[12px]">
                <SelectValue placeholder="Assign payer" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.user_id} value={member.user_id}>
                    {profileName(member.user_id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-muted-foreground">
              Payer: {profileName(unit.payer_user_id)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Members
        </p>
        {roster.length === 0 ? (
          <p className="mt-2 text-[12px] text-muted-foreground">No members assigned yet.</p>
        ) : (
          <ul className="mt-2 divide-y">
            {roster.map((member) => (
              <li key={member.id} className="py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium">{profileName(member.user_id)}</span>
                  <div className="flex items-center gap-2">
                    {manage ? (
                      <Select
                        value={member.role}
                        onValueChange={(role) =>
                          void run(
                            () => data.updateUnitMember(member.id, { role }),
                            "Role updated",
                          )
                        }
                      >
                        <SelectTrigger className="h-7 w-[130px] text-[12px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        {roleLabel(member.role)}
                      </Badge>
                    )}
                    {manage && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          void run(() => data.removeUnitMember(member.id), "Member removed")
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                {manage && member.role !== "unit_admin" && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                    {CUSTOM_PERMISSIONS.map((permission) => (
                      <label
                        key={permission.value}
                        className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                      >
                        <Checkbox
                          checked={member.permissions?.includes(permission.value) ?? false}
                          onCheckedChange={(checked) =>
                            void run(
                              () =>
                                data.updateUnitMember(member.id, {
                                  permissions: checked
                                    ? [...(member.permissions ?? []), permission.value]
                                    : (member.permissions ?? []).filter(
                                        (v) => v !== permission.value,
                                      ),
                                }),
                              "Permissions updated",
                            )
                          }
                        />
                        {permission.label}
                      </label>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {manage && (
          <div className="mt-3 flex items-center gap-2">
            <Select value={addUser} onValueChange={setAddUser}>
              <SelectTrigger className="h-8 flex-1 text-[12px]">
                <SelectValue placeholder="Add workspace member to Unit" />
              </SelectTrigger>
              <SelectContent>
                {members
                  .filter((m) => !roster.some((r) => r.user_id === m.user_id))
                  .map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {profileName(member.user_id)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={!addUser}
              onClick={() => {
                const userToAdd = addUser;
                setAddUser("");
                void run(
                  () =>
                    data.addUnitMember({
                      unit_id: unit.id,
                      workspace_id: workspace!.id,
                      user_id: userToAdd,
                      role: "viewer",
                      permissions: [],
                    }),
                  "Member added to Unit",
                ).then(() =>
                  data.logActivity({
                    workspace_id: workspace!.id,
                    unit_id: unit.id,
                    actor_id: userId,
                    action: "Unit member added",
                    detail: unit.name,
                  }),
                );
              }}
            >
              Add
            </Button>
          </div>
        )}
      </div>
    </Panel>
  );
}

function CreateUnitDialog() {
  const { workspace, userId, members, profileName } = useWorkspace();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    purpose: "",
    billing_mode: "central",
    payer_user_id: "",
    enabled_functions: UNIT_FUNCTIONS.map((fn) => fn.value) as string[],
    admin_user_id: userId,
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const unit = await data.createUnit({
        workspace_id: workspace!.id,
        name: form.name.trim(),
        purpose: form.purpose || null,
        enabled_functions: form.enabled_functions,
        billing_mode: form.billing_mode,
        payer_user_id: form.payer_user_id || null,
        created_by: userId,
      });
      await data.addUnitMember({
        unit_id: unit.id,
        workspace_id: workspace!.id,
        user_id: form.admin_user_id,
        role: "unit_admin",
        permissions: CUSTOM_PERMISSIONS.map((p) => p.value),
      });
      await data.logActivity({
        workspace_id: workspace!.id,
        unit_id: unit.id,
        actor_id: userId,
        action: "Unit created",
        detail: unit.name,
      });
      toast.success("Unit created");
      setOpen(false);
      setForm({ ...form, name: "", purpose: "" });
      void queryClient.invalidateQueries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create Unit");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> New Unit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a Unit</DialogTitle>
          <DialogDescription>
            Name it whatever fits your organization — “Website Infrastructure”, “Client A”, “New
            York Operations”, “Product Launch”.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="unit-name">Unit name</Label>
            <Input
              id="unit-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Website Infrastructure"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unit-purpose">Purpose</Label>
            <Textarea
              id="unit-purpose"
              rows={2}
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              placeholder="What this Unit is responsible for"
            />
          </div>
          <div className="space-y-2">
            <Label>Enabled functions</Label>
            <div className="grid grid-cols-2 gap-2">
              {UNIT_FUNCTIONS.map((fn) => (
                <label key={fn.value} className="flex items-center gap-2 text-[12px]">
                  <Checkbox
                    checked={form.enabled_functions.includes(fn.value)}
                    onCheckedChange={(checked) =>
                      setForm({
                        ...form,
                        enabled_functions: checked
                          ? [...form.enabled_functions, fn.value]
                          : form.enabled_functions.filter((v) => v !== fn.value),
                      })
                    }
                  />
                  {fn.label}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Unit admin</Label>
              <Select
                value={form.admin_user_id}
                onValueChange={(admin_user_id) => setForm({ ...form, admin_user_id })}
              >
                <SelectTrigger>
                  <SelectValue />
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
            <div className="space-y-1.5">
              <Label>Billing</Label>
              <Select
                value={form.billing_mode}
                onValueChange={(billing_mode) => setForm({ ...form, billing_mode })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="central">Central (Workspace pays)</SelectItem>
                  <SelectItem value="unit">Unit billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Unit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
