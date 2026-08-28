import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader, Panel } from "@/components/app/AppShell";
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
import { SEVERITIES, severityDotClass, timeAgo } from "@/lib/ows/model";
import { useUnit } from "@/lib/ows/unit";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/unit/$unitId/alerts")({
  component: UnitAlerts,
});

function UnitAlerts() {
  const { unit, alerts, systems, can, isAdmin } = useUnit();
  const queryClient = useQueryClient();

  const resolve = useMutation({
    mutationFn: (id: string) => data.resolveNotification(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Alert marked resolved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const open = alerts.filter((a) => a.severity !== "resolved");
  const resolved = alerts.filter((a) => a.severity === "resolved");
  const canResolve = isAdmin || can("alerts.resolve");

  return (
    <div>
      <PageHeader
        title="Alerts"
        description={`Everything ${unit.name} has been told about, newest first.`}
        action={(isAdmin || can("alerts.create")) && <RecordAlert />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={`Needs attention (${open.length})`}>
          {open.length === 0 ? (
            <EmptyState>Nothing needs attention in this Unit.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {open.map((alert) => (
                <li key={alert.id} className="rounded-lg border p-3.5">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-1.5 size-1.5 shrink-0 rounded-full ${severityDotClass(alert.severity)}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium">{alert.title}</p>
                      {alert.body && (
                        <p className="mt-1 text-[12px] text-muted-foreground">{alert.body}</p>
                      )}
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        {systems.find((s) => s.id === alert.system_id)?.name ?? "No system"} ·{" "}
                        {timeAgo(alert.created_at)}
                      </p>
                    </div>
                    {canResolve && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolve.mutate(alert.id)}
                        disabled={resolve.isPending}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={`Resolved (${resolved.length})`}>
          {resolved.length === 0 ? (
            <EmptyState>No resolved alerts yet.</EmptyState>
          ) : (
            <ul className="space-y-2.5">
              {resolved.map((alert) => (
                <li key={alert.id} className="flex items-center gap-2.5 text-[13px]">
                  <span className="size-1.5 shrink-0 rounded-full bg-success" />
                  <span className="truncate">{alert.title}</span>
                  <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                    {timeAgo(alert.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function RecordAlert() {
  const { unit, systems } = useUnit();
  const { workspace, userId } = useWorkspace();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ severity: "warning", title: "", body: "", system_id: "" });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await data.createNotification({
        workspace_id: workspace!.id,
        unit_id: unit.id,
        system_id: form.system_id || null,
        severity: form.severity,
        title: form.title.trim(),
        body: form.body.trim() || null,
        created_by: userId,
      });
      await data.logActivity({
        workspace_id: workspace!.id,
        unit_id: unit.id,
        actor_id: userId,
        action: "alert.recorded",
        detail: form.title.trim(),
      });
      void queryClient.invalidateQueries();
      setOpen(false);
      setForm({ severity: "warning", title: "", body: "", system_id: "" });
      toast.success("Alert recorded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not record alert");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" /> Record an alert
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record an alert in {unit.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="alert-title">What happened?</Label>
            <Input
              id="alert-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>How serious is it?</Label>
            <Select
              value={form.severity}
              onValueChange={(severity) => setForm({ ...form, severity })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERITIES.filter((s) => s.value !== "resolved").map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Which system?</Label>
            <Select
              value={form.system_id}
              onValueChange={(system_id) => setForm({ ...form, system_id })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                {systems.map((system) => (
                  <SelectItem key={system.id} value={system.id}>
                    {system.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="alert-body">Notes</Label>
            <Textarea
              id="alert-body"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={form.title.trim().length === 0}>
            Record alert
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
