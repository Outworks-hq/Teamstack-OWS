import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BellPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader, Panel } from "@/components/app/AppShell";
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
import { SEVERITIES, severityDotClass, timeAgo } from "@/lib/ows/model";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { workspace, units, profileName, hasUnitPermission } = useWorkspace();
  const workspaceId = workspace!.id;
  const queryClient = useQueryClient();
  const [severityFilter, setSeverityFilter] = useState("all");

  const notifications =
    useQuery({
      queryKey: ["notifications", workspaceId],
      queryFn: () => data.listNotifications(workspaceId),
    }).data ?? [];
  const systems =
    useQuery({ queryKey: ["systems", workspaceId], queryFn: () => data.listSystems(workspaceId) })
      .data ?? [];

  const visible =
    severityFilter === "all"
      ? notifications
      : notifications.filter((n) => n.severity === severityFilter);

  return (
    <>
      <PageHeader
        title="Notifications & alerts"
        description="One unified area for workspace, Unit and system notifications. Real platform notifications land here once connectors are added."
        action={
          <div className="flex items-center gap-2">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                {SEVERITIES.map((severity) => (
                  <SelectItem key={severity.value} value={severity.value}>
                    {severity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CreateNotificationDialog />
          </div>
        }
      />

      <Panel>
        {visible.length === 0 ? (
          <EmptyState>Nothing recorded in this scope.</EmptyState>
        ) : (
          <ul className="divide-y">
            {visible.map((notification) => {
              const unit = units.find((u) => u.id === notification.unit_id);
              const system = systems.find((s) => s.id === notification.system_id);
              const canResolve =
                notification.severity !== "resolved" &&
                hasUnitPermission(notification.unit_id, "alerts.resolve");
              return (
                <li key={notification.id} className="flex items-start gap-3 py-3">
                  <span
                    className={`mt-2 size-2 shrink-0 rounded-full ${severityDotClass(notification.severity)}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-medium">{notification.title}</p>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {notification.severity}
                      </Badge>
                    </div>
                    {notification.body && (
                      <p className="mt-1 text-[12px] text-muted-foreground">{notification.body}</p>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {[
                        system?.name ?? "Workspace",
                        unit?.name,
                        profileName(notification.created_by),
                        timeAgo(notification.created_at),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  {canResolve && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await data.resolveNotification(notification.id);
                          toast.success("Marked resolved");
                          void queryClient.invalidateQueries();
                        } catch (error) {
                          toast.error(
                            error instanceof Error ? error.message : "Could not resolve alert",
                          );
                        }
                      }}
                    >
                      Resolve
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}

function CreateNotificationDialog() {
  const { workspace, units, userId } = useWorkspace();
  const workspaceId = workspace!.id;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    severity: "info",
    unit_id: "",
    system_id: "",
  });

  const systems =
    useQuery({ queryKey: ["systems", workspaceId], queryFn: () => data.listSystems(workspaceId) })
      .data ?? [];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await data.createNotification({
        workspace_id: workspaceId,
        unit_id: form.unit_id || null,
        system_id: form.system_id || null,
        severity: form.severity,
        title: form.title.trim(),
        body: form.body || null,
        created_by: userId,
      });
      toast.success("Notification recorded");
      setOpen(false);
      setForm({ ...form, title: "", body: "" });
      void queryClient.invalidateQueries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not record notification");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <BellPlus className="size-4" /> Record alert
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a notification</DialogTitle>
          <DialogDescription>
            Attach it to the workspace, a Unit, or a specific system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="alert-title">Title</Label>
            <Input
              id="alert-title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="alert-body">Details</Label>
            <Textarea
              id="alert-body"
              rows={3}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Severity</Label>
              <Select
                value={form.severity}
                onValueChange={(severity) => setForm({ ...form, severity })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITIES.filter((s) => s.value !== "resolved").map((severity) => (
                    <SelectItem key={severity.value} value={severity.value}>
                      {severity.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Label>System</Label>
              <Select
                value={form.system_id}
                onValueChange={(system_id) => setForm({ ...form, system_id })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
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
          </div>
          <DialogFooter>
            <Button type="submit">Record</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
