import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader, Panel, WorkspaceShell } from "@/components/app/AppShell";
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
import * as data from "@/lib/ows/data";
import { formatMoney } from "@/lib/ows/model";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/billing")({
  component: () => (
    <WorkspaceShell>
      <BillingPage />
    </WorkspaceShell>
  ),
});

function BillingPage() {
  const { workspace, units, profileName, isWorkspaceAdmin, hasUnitPermission } = useWorkspace();
  const workspaceId = workspace!.id;
  const queryClient = useQueryClient();

  const records =
    useQuery({ queryKey: ["billing", workspaceId], queryFn: () => data.listBilling(workspaceId) })
      .data ?? [];

  const central = units.filter((u) => u.billing_mode !== "unit");
  const unitBilled = units.filter((u) => u.billing_mode === "unit");
  const total = records.reduce((sum, record) => sum + (record.amount_cents ?? 0), 0);
  const outstanding = records
    .filter((record) => record.status !== "paid")
    .reduce((sum, record) => sum + (record.amount_cents ?? 0), 0);

  async function setMode(unitId: string, billing_mode: string) {
    try {
      await data.updateUnit(unitId, { billing_mode });
      toast.success("Billing responsibility updated");
      void queryClient.invalidateQueries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update billing");
    }
  }

  return (
    <>
      <PageHeader
        title="Billing & accounts"
        description="Members are never charged per seat. Each Unit is either covered centrally by the Workspace owner or billed to its own assigned payer."
        action={isWorkspaceAdmin ? <AddRecordDialog /> : undefined}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Panel title="Recorded spend">
          <p className="text-[24px] font-semibold tracking-tight">{formatMoney(total)}</p>
        </Panel>
        <Panel title="Outstanding">
          <p className="text-[24px] font-semibold tracking-tight">{formatMoney(outstanding)}</p>
        </Panel>
        <Panel title="Structure">
          <p className="text-[13px]">
            {central.length} centrally billed · {unitBilled.length} Unit billed
          </p>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Billing responsibility by Unit">
          {units.length === 0 ? (
            <EmptyState>No Units yet.</EmptyState>
          ) : (
            <ul className="divide-y">
              {units.map((unit) => (
                <li key={unit.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium">{unit.name}</p>
                    <p className="text-[12px] text-muted-foreground">
                      Payer: {profileName(unit.payer_user_id)}
                    </p>
                  </div>
                  {isWorkspaceAdmin ? (
                    <Select
                      value={unit.billing_mode}
                      onValueChange={(mode) => void setMode(unit.id, mode)}
                    >
                      <SelectTrigger className="h-8 w-[190px] shrink-0 text-[12px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="central">Central (Workspace pays)</SelectItem>
                        <SelectItem value="unit">Unit billing</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {unit.billing_mode === "unit" ? "Unit billing" : "Central billing"}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Billing records">
          {records.length === 0 ? (
            <EmptyState>
              No billing records yet. Connector-driven billing data will populate this
              automatically.
            </EmptyState>
          ) : (
            <ul className="divide-y">
              {records.map((record) => {
                const unit = units.find((u) => u.id === record.unit_id);
                const visible =
                  isWorkspaceAdmin || hasUnitPermission(record.unit_id, "billing.view");
                return (
                  <li key={record.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium">{unit?.name ?? "Workspace"}</p>
                      <p className="text-[12px] text-muted-foreground">
                        Payer: {profileName(record.payer_user_id)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[13px] font-semibold">
                        {visible ? formatMoney(record.amount_cents ?? 0) : "—"}
                      </span>
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {record.status}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}

function AddRecordDialog() {
  const { workspace, units, members, profileName } = useWorkspace();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    unit_id: "",
    amount: "",
    payer_user_id: "",
    status: "open",
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await data.upsertBillingRecord({
        workspace_id: workspace!.id,
        unit_id: form.unit_id || null,
        amount_cents: Math.round(Number(form.amount || 0) * 100),
        payer_user_id: form.payer_user_id || null,
        status: form.status,
      });
      toast.success("Billing record added");
      setOpen(false);
      setForm({ ...form, amount: "" });
      void queryClient.invalidateQueries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add record");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Add record
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add billing record</DialogTitle>
          <DialogDescription>
            Manual entry for the MVP. Connected platforms can report real billing data later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Select
                value={form.unit_id}
                onValueChange={(unit_id) => setForm({ ...form, unit_id })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Workspace" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payer</Label>
              <Select
                value={form.payer_user_id}
                onValueChange={(payer_user_id) => setForm({ ...form, payer_user_id })}
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
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(status) => setForm({ ...form, status })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add record</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
