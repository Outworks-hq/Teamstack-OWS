import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LogOut } from "lucide-react";

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
import { roleLabel } from "@/lib/ows/model";
import { useWorkspace } from "@/lib/ows/workspace";

const NAV = [
  { label: "Console", to: "/app/console" },
  { label: "Control Room", to: "/app/control-room" },
  { label: "Systems", to: "/app/systems" },
  { label: "Connected Operations", to: "/app/flows" },
  { label: "Units", to: "/app/units" },
  { label: "Members", to: "/app/members" },
  { label: "Notifications", to: "/app/notifications" },
  { label: "Billing", to: "/app/billing" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { workspace, workspaces, setWorkspaceId, userEmail, myWorkspaceRole } = useWorkspace();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const demoMode = isDemoMode();

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

  const initial = (userEmail[0] ?? "A").toUpperCase();

  return (
    <div className="min-h-screen bg-canvas px-3 py-3 lg:px-6 lg:py-6">
      <div className="mx-auto max-w-[1440px] overflow-hidden rounded-2xl border bg-background shadow-card">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/app/console" className="flex items-center gap-2">
              <LogoMark className="size-5" />
              <span className="text-[15px] font-semibold tracking-tight">
                TeamStack <span className="font-normal text-muted-foreground">OWS</span>
              </span>
            </Link>

            {workspace && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px]">
                    {workspace.name}
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                  {workspaces.map((ws) => (
                    <DropdownMenuItem key={ws.id} onClick={() => setWorkspaceId(ws.id)}>
                      {ws.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/app/units">Manage units</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
            {myWorkspaceRole && (
              <span className="hidden rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground sm:inline">
                {roleLabel(myWorkspaceRole)}
              </span>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex size-8 items-center justify-center rounded-full bg-primary text-[12px] font-medium text-primary-foreground">
                  {initial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-normal text-muted-foreground">
                  {userEmail}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void signOut()}>
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b px-5 lg:px-8">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="shrink-0 border-b-2 border-transparent px-3 py-3 text-[13px] whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "border-brand text-foreground font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}

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
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 max-w-[70ch] text-[13px] text-muted-foreground">{description}</p>
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
    <section className={`rounded-xl border bg-card p-4 shadow-card ${className ?? ""}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="text-[13px] font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed px-4 py-6 text-center text-[13px] text-muted-foreground">
      {children}
    </p>
  );
}

export { Button };
