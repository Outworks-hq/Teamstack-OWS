import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2, UserPlus } from "lucide-react";
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
import { UNIT_ROLES, WORKSPACE_ROLES, roleLabel, timeAgo } from "@/lib/ows/model";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/members")({
  component: () => (
    <WorkspaceShell>
      <MembersPage />
    </WorkspaceShell>
  ),
});

function MembersPage() {
  const { workspace, members, units, unitMembers, profileName, isWorkspaceAdmin, userId } =
    useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = workspace!.id;

  const invitations =
    useQuery({
      queryKey: ["invitations", workspaceId],
      queryFn: () => data.listInvitations(workspaceId),
      enabled: isWorkspaceAdmin,
    }).data ?? [];

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
    <>
      <PageHeader
        title="Members"
        description="Workspace membership, roles and invitations. Unit-level roles and permissions are configured inside each Unit."
        action={isWorkspaceAdmin ? <InviteDialog /> : undefined}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Workspace members" className="lg:col-span-2">
          <ul className="divide-y">
            {members.map((member) => {
              const unitList = unitMembers
                .filter((m) => m.user_id === member.user_id)
                .map((m) => units.find((u) => u.id === m.unit_id)?.name)
                .filter(Boolean);
              return (
                <li key={member.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium">{profileName(member.user_id)}</p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {unitList.length ? unitList.join(" · ") : "No Units yet"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {isWorkspaceAdmin && member.role !== "owner" ? (
                      <Select
                        value={member.role}
                        onValueChange={(role) =>
                          void run(
                            () => data.updateWorkspaceMemberRole(member.id, role),
                            "Role updated",
                          )
                        }
                      >
                        <SelectTrigger className="h-8 w-[170px] text-[12px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WORKSPACE_ROLES.filter((r) => r.value !== "owner").map((role) => (
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
                    {isWorkspaceAdmin && member.role !== "owner" && member.user_id !== userId && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          void run(
                            () => data.removeWorkspaceMember(member.id),
                            "Member removed from workspace",
                          )
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Invitations">
          {!isWorkspaceAdmin ? (
            <EmptyState>Only workspace admins can manage invitations.</EmptyState>
          ) : invitations.length === 0 ? (
            <EmptyState>No invitations sent yet.</EmptyState>
          ) : (
            <ul className="divide-y">
              {invitations.map((invitation) => (
                <li key={invitation.id} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[13px] font-medium">{invitation.email}</p>
                    <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
                      {invitation.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {roleLabel(invitation.workspace_role)} ·{" "}
                    {units.find((u) => u.id === invitation.unit_id)?.name ?? "No Unit"} ·{" "}
                    {timeAgo(invitation.created_at)}
                  </p>
                  {invitation.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() =>
                        void run(() => data.revokeInvitation(invitation.id), "Invitation revoked")
                      }
                    >
                      Revoke
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}

function InviteDialog() {
  const { workspace, units, userId } = useWorkspace();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    workspace_role: "editor",
    unit_id: "",
    unit_role: "viewer",
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await data.createInvitation({
        workspace_id: workspace!.id,
        unit_id: form.unit_id || null,
        email: form.email.trim().toLowerCase(),
        workspace_role: form.workspace_role,
        unit_role: form.unit_role,
        invited_by: userId,
      });
      await data.logActivity({
        workspace_id: workspace!.id,
        unit_id: form.unit_id || null,
        actor_id: userId,
        action: "Member invited",
        detail: form.email,
      });
      toast.success("Invitation created — it applies as soon as they sign up with this email.");
      setOpen(false);
      setForm({ ...form, email: "" });
      void queryClient.invalidateQueries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create invitation");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" /> Invite member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>
            The invitation is applied automatically when they create an account with this email.
            Members are not charged per seat.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Workspace role</Label>
              <Select
                value={form.workspace_role}
                onValueChange={(workspace_role) => setForm({ ...form, workspace_role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKSPACE_ROLES.filter((r) => r.value !== "owner").map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Unit role</Label>
              <Select
                value={form.unit_role}
                onValueChange={(unit_role) => setForm({ ...form, unit_role })}
              >
                <SelectTrigger>
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
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Unit (optional)</Label>
            <Select value={form.unit_id} onValueChange={(unit_id) => setForm({ ...form, unit_id })}>
              <SelectTrigger>
                <SelectValue placeholder="No Unit" />
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
          <DialogFooter>
            <Button type="submit">Send invitation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
