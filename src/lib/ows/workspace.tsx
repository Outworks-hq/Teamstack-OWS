import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

import * as data from "./data";
import type { Profile, Unit, UnitMember, Workspace, WorkspaceMember } from "./model";

const STORAGE_KEY = "ows.workspace";

interface WorkspaceContextValue {
  userId: string;
  userEmail: string;
  workspaces: Workspace[];
  workspace: Workspace | null;
  setWorkspaceId: (id: string) => void;
  members: WorkspaceMember[];
  profiles: Profile[];
  units: Unit[];
  unitMembers: UnitMember[];
  myWorkspaceRole: string | null;
  isWorkspaceAdmin: boolean;
  isUnitAdmin: (unitId: string | null | undefined) => boolean;
  canManageUnit: (unitId: string | null | undefined) => boolean;
  hasUnitPermission: (unitId: string | null | undefined, permission: string) => boolean;
  profileName: (userId: string | null | undefined) => string;
  loading: boolean;
  refresh: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  userId,
  userEmail,
  children,
}: {
  userId: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const [workspaceId, setWorkspaceIdState] = useState<string | null>(() =>
    typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY),
  );

  const workspacesQuery = useQuery({ queryKey: ["workspaces"], queryFn: data.listWorkspaces });
  const workspaces = workspacesQuery.data ?? [];

  const activeId = useMemo(() => {
    if (workspaceId && workspaces.some((w) => w.id === workspaceId)) return workspaceId;
    return workspaces[0]?.id ?? null;
  }, [workspaceId, workspaces]);

  const setWorkspaceId = useCallback((id: string) => {
    window.localStorage.setItem(STORAGE_KEY, id);
    setWorkspaceIdState(id);
  }, []);

  useEffect(() => {
    if (activeId && activeId !== workspaceId) setWorkspaceId(activeId);
  }, [activeId, workspaceId, setWorkspaceId]);

  const membersQuery = useQuery({
    queryKey: ["workspace_members", activeId],
    queryFn: () => data.listWorkspaceMembers(activeId!),
    enabled: !!activeId,
  });
  const unitsQuery = useQuery({
    queryKey: ["units", activeId],
    queryFn: () => data.listUnits(activeId!),
    enabled: !!activeId,
  });
  const unitMembersQuery = useQuery({
    queryKey: ["unit_members", activeId],
    queryFn: () => data.listUnitMembers(activeId!),
    enabled: !!activeId,
  });

  const members = membersQuery.data ?? [];
  const memberIds = members.map((m) => m.user_id);
  const profilesQuery = useQuery({
    queryKey: ["profiles", memberIds.join(",")],
    queryFn: () => data.listProfiles(memberIds),
    enabled: memberIds.length > 0,
  });

  const units = unitsQuery.data ?? [];
  const unitMembers = unitMembersQuery.data ?? [];
  const profiles = profilesQuery.data ?? [];
  const workspace = workspaces.find((w) => w.id === activeId) ?? null;
  const myWorkspaceRole = members.find((m) => m.user_id === userId)?.role ?? null;
  const isWorkspaceAdmin = myWorkspaceRole === "owner" || myWorkspaceRole === "admin";

  const isUnitAdmin = useCallback(
    (unitId: string | null | undefined) =>
      !!unitId &&
      unitMembers.some((m) => m.unit_id === unitId && m.user_id === userId && m.role === "unit_admin"),
    [unitMembers, userId],
  );

  const canManageUnit = useCallback(
    (unitId: string | null | undefined) => isWorkspaceAdmin || isUnitAdmin(unitId),
    [isWorkspaceAdmin, isUnitAdmin],
  );

  const hasUnitPermission = useCallback(
    (unitId: string | null | undefined, permission: string) => {
      if (isWorkspaceAdmin || isUnitAdmin(unitId)) return true;
      const membership = unitMembers.find((m) => m.unit_id === unitId && m.user_id === userId);
      return !!membership?.permissions?.includes(permission);
    },
    [isWorkspaceAdmin, isUnitAdmin, unitMembers, userId],
  );

  const profileName = useCallback(
    (id: string | null | undefined) => {
      if (!id) return "Unassigned";
      const profile = profiles.find((p) => p.id === id);
      return profile?.full_name || profile?.email || "Unknown member";
    },
    [profiles],
  );

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries();
  }, [queryClient]);

  const value: WorkspaceContextValue = {
    userId,
    userEmail,
    workspaces,
    workspace,
    setWorkspaceId,
    members,
    profiles,
    units,
    unitMembers,
    myWorkspaceRole,
    isWorkspaceAdmin,
    isUnitAdmin,
    canManageUnit,
    hasUnitPermission,
    profileName,
    loading: workspacesQuery.isLoading,
    refresh,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}

/** Current signed-in user, hydrated client-side. */
export function useAuthUser() {
  const [state, setState] = useState<{
    loading: boolean;
    userId: string | null;
    email: string;
  }>({ loading: true, userId: null, email: "" });

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data: result }) => {
      if (!active) return;
      setState({
        loading: false,
        userId: result.user?.id ?? null,
        email: result.user?.email ?? "",
      });
    });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
