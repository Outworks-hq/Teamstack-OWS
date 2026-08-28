import { Link, createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { EmptyState, PageHeader, Panel } from "@/components/app/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CUSTOM_PERMISSIONS, roleLabel } from "@/lib/ows/model";
import { useUnit } from "@/lib/ows/unit";
import { useWorkspace } from "@/lib/ows/workspace";

export const Route = createFileRoute("/_authenticated/app/unit/$unitId/access")({
  component: UnitAccess,
});

function UnitAccess() {
  const { unit, roster, isAdmin } = useUnit();
  const { profileName } = useWorkspace();

  return (
    <div>
      <PageHeader
        title="Access"
        description={`Who can work inside ${unit.name}, and what each person is allowed to do here.`}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="People in this Unit" className="lg:col-span-2">
          {roster.length === 0 ? (
            <EmptyState>Nobody has been given access to this Unit yet.</EmptyState>
          ) : (
            <ul className="divide-y">
              {roster.map((member) => {
                const permissions = (member.permissions ?? []) as string[];
                return (
                  <li key={member.id} className="py-4 first:pt-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-full bg-muted text-[12px] font-medium">
                        {profileName(member.user_id).slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium">
                          {profileName(member.user_id)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {roleLabel(member.role)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-auto">
                        {roleLabel(member.role)}
                      </Badge>
                    </div>
                    {permissions.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 pl-11">
                        {permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-[10px]">
                            {CUSTOM_PERMISSIONS.find((p) => p.value === permission)?.label ??
                              permission}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Changing access">
          <p className="text-[13px] text-muted-foreground">
            People are invited once at organization level, then given access to the Units they work
            in. {isAdmin ? "You can manage that here:" : "A Workspace admin manages that."}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/app/members">
              Organization people <ExternalLink className="size-3.5" />
            </Link>
          </Button>
        </Panel>
      </div>
    </div>
  );
}
