import { ChevronDown, ChevronRight, FileText, GitBranch, KeyRound, RotateCw } from "lucide-react";

import { LogoMark } from "@/components/brand/Logo";
import { ProviderMark, ProviderWordmark } from "@/components/brand/ProviderMark";

const STRIP = ["aws", "stripe", "twilio", "github", "vercel", "netlify", "google_workspace"];
const TILES = ["aws", "stripe", "github", "vercel", "twilio", "netlify", "google_workspace"];

const ALERTS = [
  { title: "High error rate", ago: "2m ago", tone: "critical" },
  { title: "Database CPU high", ago: "8m ago", tone: "warning" },
  { title: "Twilio SMS delivery issue", ago: "27m ago", tone: "warning" },
] as const;

const ACCESS = [
  ["Engineers", "18"],
  ["Operations", "8"],
  ["Finance", "4"],
  ["Admins", "2"],
] as const;

const ACTIONS = [
  { label: "Restart service", icon: RotateCw },
  { label: "View logs", icon: FileText },
  { label: "Manage access", icon: KeyRound },
  { label: "Create deployment", icon: GitBranch },
] as const;

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-xl border bg-card p-4 shadow-card">{children}</div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] font-semibold">{children}</p>;
}

function CardLink({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-auto pt-4 text-[12px] font-medium text-brand">
      {children} <span aria-hidden="true">→</span>
    </p>
  );
}

/**
 * Static marketing rendering of the real Console surface users land on after
 * signing in. Presentation only — no product data.
 */
export function DashboardPreview() {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-panel">
      {/* app chrome */}
      <div className="flex items-center justify-between gap-4 border-b px-2 pb-4">
        <div className="flex items-center gap-2">
          <LogoMark className="size-5" />
          <span className="text-[14px] font-semibold tracking-tight">
            TeamStack <span className="font-normal text-muted-foreground">OWS</span>
          </span>
        </div>
        <div className="hidden items-center gap-7 sm:flex">
          <span className="border-b-2 border-brand pb-[15px] text-[13px] font-medium text-foreground">
            Console
          </span>
          <span className="text-[13px] text-muted-foreground">Control Room</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-lg border px-3 py-1.5 text-[12px] text-muted-foreground sm:flex">
            Last 24 hours <ChevronDown className="size-3.5" />
          </span>
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">
            A
          </span>
        </div>
      </div>

      {/* metric row */}
      <div className="grid gap-4 px-2 py-4 md:grid-cols-3 xl:grid-cols-5">
        <CardShell>
          <CardTitle>Connected systems</CardTitle>
          <p className="mt-2 text-2xl font-semibold tracking-tight">28</p>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-success" /> All healthy
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {TILES.map((id) => (
              <ProviderMark key={id} providerId={id} />
            ))}
          </div>
          <CardLink>View all systems</CardLink>
        </CardShell>

        <CardShell>
          <CardTitle>Alerts</CardTitle>
          <p className="mt-2 text-2xl font-semibold tracking-tight">3</p>
          <ul className="mt-3 space-y-2">
            {ALERTS.map((alert) => (
              <li key={alert.title} className="flex items-center gap-2 text-[12px]">
                <span
                  className={
                    alert.tone === "critical"
                      ? "size-1.5 shrink-0 rounded-full bg-destructive"
                      : "size-1.5 shrink-0 rounded-full bg-warning"
                  }
                />
                <span className="truncate">{alert.title}</span>
                <span className="ml-auto shrink-0 text-muted-foreground">{alert.ago}</span>
              </li>
            ))}
          </ul>
          <CardLink>View all alerts</CardLink>
        </CardShell>

        <CardShell>
          <CardTitle>Billing</CardTitle>
          <p className="mt-2 text-2xl font-semibold tracking-tight">$4,280.50</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            <span className="font-medium text-success">▲ 12%</span> vs yesterday
          </p>
          <svg viewBox="0 0 200 60" className="mt-3 h-14 w-full text-brand" fill="none">
            <path
              d="M0 46 C14 44 22 34 34 36 C46 38 52 26 66 30 C80 34 86 18 100 22 C114 26 120 34 132 30 C146 25 152 10 166 12 C180 14 190 8 200 6"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M0 46 C14 44 22 34 34 36 C46 38 52 26 66 30 C80 34 86 18 100 22 C114 26 120 34 132 30 C146 25 152 10 166 12 C180 14 190 8 200 6 L200 60 L0 60 Z"
              fill="currentColor"
              opacity="0.07"
            />
          </svg>
          <CardLink>View billing</CardLink>
        </CardShell>

        <CardShell>
          <CardTitle>Access</CardTitle>
          <p className="mt-2 text-2xl font-semibold tracking-tight">42</p>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-success" /> Active members
          </p>
          <dl className="mt-3 space-y-1.5">
            {ACCESS.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between text-[12px]">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <CardLink>Manage access</CardLink>
        </CardShell>

        <CardShell>
          <CardTitle>Actions</CardTitle>
          <ul className="mt-3 space-y-2">
            {ACTIONS.map((action) => (
              <li
                key={action.label}
                className="flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[12px]"
              >
                <action.icon className="size-3.5 text-brand" />
                {action.label}
                <ChevronRight className="ml-auto size-3.5 text-muted-foreground" />
              </li>
            ))}
          </ul>
          <CardLink>See all actions</CardLink>
        </CardShell>
      </div>

      {/* provider strip */}
      <div className="mx-2 rounded-xl border bg-card p-4 shadow-card">
        <p className="text-[12px] text-muted-foreground">Works with the tools you rely on</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          {STRIP.map((id) => (
            <ProviderWordmark key={id} providerId={id} />
          ))}
        </div>
      </div>

      {/* console / control room */}
      <div className="grid gap-4 px-2 pt-4 lg:grid-cols-2">
        {[
          {
            title: "Console",
            body: "Your day-to-day operations hub. Monitor, investigate, and take action across all connected tools.",
          },
          {
            title: "Control Room",
            body: "Real-time system health and alerts. See what's happening, what's changing, and what needs attention.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-card"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft">
              <LogoMark className="size-4" />
            </span>
            <div>
              <p className="text-[13px] font-semibold">{item.title}</p>
              <p className="mt-1 max-w-[42ch] text-[12px] leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
            <ChevronRight className="ml-auto size-4 shrink-0 self-center text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
}
