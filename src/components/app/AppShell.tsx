import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  Bell,
  Building2,
  Check,
  ChevronsUpDown,
  KeyRound,
  LayoutGrid,
  LogOut,
  Receipt,
  Settings2,
  Users,
  Zap,
} from "lucide-react";

import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { exitDemoMode, isDemoMode } from "@/lib/ows/demo";
import type { Unit } from "@/lib/ows/model";
import { useWorkspace } from "@/lib/ows/workspace";

/* ---------------------------------------------------------------- session */

function useSessionActions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function leaveDemo() {
    await queryClient.cancelQueries();
    queryClient.clear();
    exitDemoMode();
    window.location.href = "/auth";
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return { leaveDemo, signOut };
}

/* ---------------------------------------------------------------- sidebar */

const ORG_LINKS = [
  { label: "Units", to: "/app/workspace" as const, icon: LayoutGrid, exact: true },
  { label: "People", to: "/app/members" as const, icon: Users },
  { label: "Billing", to: "/app/billing" as const, icon: Receipt },
  { label: "Unit settings", to: "/app/units" as const, icon: Settings2 },
];

function WorkspaceSelector() {
  const { workspace, workspaces, setWorkspaceId, setUnitId } = useWorkspace();
  const navigate = useNavigate();

  function choose(id: string) {
    if (id === workspace?.id) return;
    setUnitId(null);
    setWorkspaceId(id);
    void navigate({ to: "/app/workspace" });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2.5 rounded-xl border bg-background px-3 py-2.5 text-left transition-colors hover:bg-muted/50">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Building2 className="size-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium">
              {workspace?.name ?? "Workspace"}
            </span>
            <span className="block text-[11px] text-muted-foreground">Workspace</span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-64">
        <DropdownMenuLabel className="text-[11px] font-normal tracking-wide text-muted-foreground uppercase">
          Your workspaces
        </DropdownMenuLabel>
        {workspaces.map((option) => (
          <DropdownMenuItem key={option.id} onClick={() => choose(option.id)}>
            {option.id === workspace?.id ? (
              <Check className="size-4 text-brand" />
            ) : (
              <span className="size-4" />
            )}
            <span className="truncate">{option.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/app/workspaces">
            <ArrowLeftRight className="size-4" /> All workspaces
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Sidebar({ activeUnitId }: { activeUnitId?: string }) {
  const { units } = useWorkspace();

  return (
    <aside className="flex w-[248px] shrink-0 flex-col border-r bg-muted/20">
      <div className="px-4 py-4">
        <Link to="/app/workspace" className="flex items-center gap-2">
          <LogoMark className="size-5" />
          <span className="text-[14px] font-semibold tracking-tight">
            TeamStack <span className="font-normal text-muted-foreground">OWS</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-2 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Units
        </p>
        <nav className="space-y-0.5">
          {units.length === 0 && (
            <p className="px-2 py-2 text-[12px] text-muted-foreground">No Units yet.</p>
          )}
          {units.map((unit) => {
            const active = unit.id === activeUnitId;
            return (
              <Link
                key={unit.id}
                to="/app/unit/$unitId"
                params={{ unitId: unit.id }}
                className={`block truncate rounded-lg px-2.5 py-2 text-[13px] transition-colors ${
                  active
                    ? "bg-brand/10 font-medium text-brand"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {unit.name}
              </Link>
            );
          })}
        </nav>

        <p className="mt-6 px-2 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Organization
        </p>
        <nav className="space-y-0.5">
          {ORG_LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              activeOptions={{ exact: item.exact ?? false }}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "bg-muted text-foreground font-medium" }}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t p-3">
        <WorkspaceSelector />
      </div>
    </aside>
  );
}

/* ----------------------------------------------------------------- topbar */

function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { userEmail } = useWorkspace();
  const { leaveDemo, signOut } = useSessionActions();
  const demoMode = isDemoMode();
  const initial = (userEmail[0] ?? "A").toUpperCase();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5 lg:px-8">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold tracking-tight">{title}</p>
        {subtitle && <p className="truncate text-[12px] text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {demoMode && (
          <span className="hidden items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-[11px] font-medium text-brand sm:inline-flex">
            <span className="size-1.5 rounded-full bg-brand" />
            Demo Workspace — sample data only
          </span>
        )}
        {demoMode && (
          <Button variant="outline" size="sm" onClick={leaveDemo}>
            Exit demo
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Account menu"
              className="flex size-8 items-center justify-center rounded-full bg-primary text-[12px] font-medium text-primary-foreground"
            >
              {initial}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="font-normal text-muted-foreground">
              {userEmail}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/app/workspaces">
                <ArrowLeftRight className="size-4" /> Switch workspace
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void (demoMode ? leaveDemo() : signOut())}>
              <LogOut className="size-4" /> {demoMode ? "Exit demo" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function Frame({ children, activeUnitId }: { children: React.ReactNode; activeUnitId?: string }) {
  return (
    <div className="flex min-h-screen w-full bg-canvas">
      <Sidebar {...(activeUnitId ? { activeUnitId } : {})} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------- workspace level */

/** Organization level: the container that holds the Units. No operations here. */
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const { workspace } = useWorkspace();

  return (
    <Frame>
      <TopBar title={workspace?.name ?? "Workspace"} subtitle="Organization" />
      <div className="px-5 py-8 lg:px-8">{children}</div>
    </Frame>
  );
}

/* ------------------------------------------------------------- unit level */

const UNIT_NAV = [
  { label: "Console", to: "/app/unit/$unitId" as const, exact: true },
  { label: "Control Room", to: "/app/unit/$unitId/control-room" as const },
  { label: "Systems", to: "/app/unit/$unitId/systems" as const },
  { label: "Connected Operations", to: "/app/unit/$unitId/flows" as const },
];

const UNIT_MORE = [
  { label: "Alerts", to: "/app/unit/$unitId/alerts" as const, icon: Bell },
  { label: "Access", to: "/app/unit/$unitId/access" as const, icon: KeyRound },
  { label: "Usage & billing", to: "/app/unit/$unitId/billing" as const, icon: Receipt },
  { label: "Actions", to: "/app/unit/$unitId/actions" as const, icon: Zap },
];

/** One Unit's operating room: its own systems, alerts, access, usage, flows. */
export function UnitShell({ unit, children }: { unit: Unit; children: React.ReactNode }) {
  const { workspace } = useWorkspace();

  return (
    <Frame activeUnitId={unit.id}>
      <TopBar title={unit.name} subtitle={`Unit in ${workspace?.name ?? "this workspace"}`} />

      <nav className="flex items-center justify-center gap-2 border-b px-5 py-2.5 lg:px-8">
        {UNIT_NAV.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            params={{ unitId: unit.id }}
            activeOptions={{ exact: item.exact ?? false }}
            className="shrink-0 rounded-full px-3.5 py-1.5 text-[13px] whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "bg-brand/10 text-brand font-medium" }}
          >
            {item.label}
          </Link>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="shrink-0 rounded-full px-3.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground">
              More
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {UNIT_MORE.map((item) => (
              <DropdownMenuItem key={item.label} asChild>
                <Link to={item.to} params={{ unitId: unit.id }}>
                  <item.icon className="size-4 text-muted-foreground" /> {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>


      <div className="px-5 py-8 lg:px-8">{children}</div>
    </Frame>
  );
}

/* --------------------------------------------------------- shared pieces */

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-[70ch] text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border bg-card p-5 shadow-card ${className ?? ""}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-[14px] font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed px-4 py-8 text-center text-[13px] text-muted-foreground">
      {children}
    </p>
  );
}

export { Button };
