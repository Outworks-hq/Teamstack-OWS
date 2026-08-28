import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  Bell,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  KeyRound,
  LogOut,
  Receipt,
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

/* ------------------------------------------------------------------ frame */

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

function TopBar({ left }: { left: React.ReactNode }) {
  const { userEmail, workspaces, workspace } = useWorkspace();
  const { leaveDemo, signOut } = useSessionActions();
  const demoMode = isDemoMode();
  const initial = (userEmail[0] ?? "A").toUpperCase();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4 lg:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <Link to="/app/workspace" className="flex shrink-0 items-center gap-2">
          <LogoMark className="size-5" />
          <span className="text-[15px] font-semibold tracking-tight">
            TeamStack <span className="font-normal text-muted-foreground">OWS</span>
          </span>
        </Link>
        {left}
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
              aria-label="Account and workspace menu"
              className="flex size-8 items-center justify-center rounded-full bg-primary text-[12px] font-medium text-primary-foreground"
            >
              {initial}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="font-normal text-muted-foreground">
              {userEmail}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[11px] font-normal tracking-wide text-muted-foreground uppercase">
              Organization
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to="/app/workspace">
                <Building2 className="size-4" /> {workspace?.name ?? "Workspace"} home
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/app/workspaces">
                <ArrowLeftRight className="size-4" /> Switch workspace
                <span className="ml-auto text-[11px] text-muted-foreground">
                  {workspaces.length}
                </span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void (demoMode ? leaveDemo() : signOut())}>
              <LogOut className="size-4" /> {demoMode ? "Exit demo" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas px-3 py-3 lg:px-6 lg:py-6">
      <div className="mx-auto max-w-[1280px] overflow-hidden rounded-2xl border bg-background shadow-card">
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------- workspace level */

/** Organization level: the container that holds the Units. No operations here. */
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const { workspace } = useWorkspace();

  return (
    <Frame>
      <TopBar
        left={
          <span className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px]">
            <Building2 className="size-3.5 text-muted-foreground" />
            <span className="truncate">{workspace?.name ?? "Workspace"}</span>
          </span>
        }
      />
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
  const { workspace, units } = useWorkspace();
  const siblings = units.filter((u) => u.id !== unit.id);

  return (
    <Frame>
      <TopBar
        left={
          <nav aria-label="Location" className="flex min-w-0 items-center gap-1.5">
            <Link
              to="/app/workspace"
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <Building2 className="size-3.5" />
              <span className="hidden truncate sm:inline">{workspace?.name ?? "Workspace"}</span>
            </Link>
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex min-w-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px] font-medium">
                  <span className="truncate">{unit.name}</span>
                  <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
                <DropdownMenuLabel className="text-[11px] font-normal tracking-wide text-muted-foreground uppercase">
                  Units in {workspace?.name ?? "this workspace"}
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/app/unit/$unitId" params={{ unitId: unit.id }}>
                    <Check className="size-4 text-brand" />
                    <span className="truncate">{unit.name}</span>
                  </Link>
                </DropdownMenuItem>
                {siblings.map((sibling) => (
                  <DropdownMenuItem key={sibling.id} asChild>
                    <Link to="/app/unit/$unitId" params={{ unitId: sibling.id }}>
                      <span className="size-4" />
                      <span className="truncate">{sibling.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/workspace">All Units</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        }
      />

      <nav className="flex items-center gap-1 overflow-x-auto border-b px-5 lg:px-8">
        {UNIT_NAV.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            params={{ unitId: unit.id }}
            activeOptions={{ exact: item.exact ?? false }}
            className="shrink-0 border-b-2 border-transparent px-3 py-3 text-[13px] whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "border-brand text-foreground font-medium" }}
          >
            {item.label}
          </Link>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-auto shrink-0 px-3 py-3 text-[13px] text-muted-foreground transition-colors hover:text-foreground">
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
