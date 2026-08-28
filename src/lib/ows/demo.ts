/**
 * Demo mode.
 *
 * A fully in-memory sample Workspace so TeamStack OWS can be explored without an
 * account. Nothing here touches Supabase or any external integration: every read
 * and write is served from the temporary store below and disappears when the
 * visitor exits demo mode or reloads the page.
 *
 * The data layer (`data.ts`) delegates to these functions whenever demo mode is
 * active, which keeps every application screen unchanged.
 */

import type {
  ActivityEvent,
  BillingRecord,
  Flow,
  Invitation,
  Notification,
  Profile,
  SystemConnection,
  SystemRecord,
  Unit,
  UnitMember,
  Workspace,
  WorkspaceMember,
} from "./model";

const FLAG_KEY = "ows.demo";

export const DEMO_USER = {
  id: "demo-user-owner",
  email: "avery.stone@northwind.demo",
  name: "Avery Stone (demo)",
};

/* ------------------------------------------------------------------ flag */

let demoActive = false;

export function isDemoMode(): boolean {
  if (demoActive) return true;
  if (typeof window === "undefined") return false;
  demoActive = window.sessionStorage.getItem(FLAG_KEY) === "1";
  return demoActive;
}

export function startDemoMode() {
  demoActive = true;
  if (typeof window !== "undefined") window.sessionStorage.setItem(FLAG_KEY, "1");
  store = null;
  seed();
}

export function exitDemoMode() {
  demoActive = false;
  store = null;
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(FLAG_KEY);
    window.localStorage.removeItem("ows.workspace");
  }
}

/* ----------------------------------------------------------------- store */

interface DemoStore {
  workspaces: Workspace[];
  workspaceMembers: WorkspaceMember[];
  profiles: Profile[];
  units: Unit[];
  unitMembers: UnitMember[];
  systems: SystemRecord[];
  flows: Flow[];
  connections: SystemConnection[];
  notifications: Notification[];
  activity: ActivityEvent[];
  invitations: Invitation[];
  billing: BillingRecord[];
}

let store: DemoStore | null = null;
let counter = 0;

function id(prefix: string): string {
  counter += 1;
  return `demo-${prefix}-${counter}`;
}

function ago(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

const WS = "demo-workspace";

function seed(): DemoStore {
  if (store) return store;

  const people = [
    { id: DEMO_USER.id, email: DEMO_USER.email, full_name: "Avery Stone", role: "owner" },
    { id: "demo-user-2", email: "priya.raman@northwind.demo", full_name: "Priya Raman", role: "admin" },
    { id: "demo-user-3", email: "marc.delacroix@northwind.demo", full_name: "Marc Delacroix", role: "editor" },
    { id: "demo-user-4", email: "sofia.ortiz@northwind.demo", full_name: "Sofia Ortiz", role: "editor" },
    { id: "demo-user-5", email: "hana.kim@northwind.demo", full_name: "Hana Kim", role: "viewer" },
    { id: "demo-user-6", email: "tom.becker@northwind.demo", full_name: "Tom Becker", role: "viewer" },
  ];

  const allFunctions = [
    "console",
    "control_room",
    "systems",
    "notifications",
    "connected_operations",
    "billing",
  ];

  const units: Unit[] = [
    {
      id: "demo-unit-infra",
      workspace_id: WS,
      name: "Website Infrastructure",
      purpose: "Owns the public website, deployment pipeline and cloud infrastructure.",
      status: "open",
      enabled_functions: allFunctions,
      billing_mode: "unit",
      payer_user_id: "demo-user-2",
      created_by: DEMO_USER.id,
      created_at: ago(60 * 24 * 120),
    },
    {
      id: "demo-unit-funnel",
      workspace_id: WS,
      name: "Sales Funnel",
      purpose: "Ads to CRM to payments. Responsible for revenue tooling end to end.",
      status: "open",
      enabled_functions: allFunctions,
      billing_mode: "central",
      payer_user_id: null,
      created_by: DEMO_USER.id,
      created_at: ago(60 * 24 * 95),
    },
    {
      id: "demo-unit-nyc",
      workspace_id: WS,
      name: "New York Operations",
      purpose: "Regional operations team: identity, telephony and support tooling.",
      status: "open",
      enabled_functions: ["console", "systems", "notifications", "billing"],
      billing_mode: "unit",
      payer_user_id: "demo-user-3",
      created_by: DEMO_USER.id,
      created_at: ago(60 * 24 * 60),
    },
    {
      id: "demo-unit-launch",
      workspace_id: WS,
      name: "Product Launch Q4",
      purpose: "Temporary unit coordinating the Q4 launch across marketing and product.",
      status: "closed",
      enabled_functions: ["console", "systems", "notifications"],
      billing_mode: "central",
      payer_user_id: null,
      created_by: DEMO_USER.id,
      created_at: ago(60 * 24 * 20),
    },
  ];

  const unitMembers: UnitMember[] = [
    ["demo-unit-infra", "demo-user-2", "unit_admin", []],
    ["demo-unit-infra", "demo-user-3", "editor", ["systems.edit", "alerts.resolve"]],
    ["demo-unit-infra", "demo-user-5", "viewer", ["alerts.create"]],
    ["demo-unit-funnel", "demo-user-4", "unit_admin", []],
    ["demo-unit-funnel", "demo-user-5", "editor", ["systems.add", "flows.edit"]],
    ["demo-unit-funnel", "demo-user-6", "viewer", []],
    ["demo-unit-nyc", "demo-user-3", "unit_admin", []],
    ["demo-unit-nyc", "demo-user-6", "viewer", ["billing.view"]],
    ["demo-unit-launch", "demo-user-4", "editor", []],
  ].map(([unit_id, user_id, role, permissions]) => ({
    id: id("um"),
    unit_id: unit_id as string,
    workspace_id: WS,
    user_id: user_id as string,
    role: role as string,
    permissions: permissions as string[],
    created_at: ago(60 * 24 * 40),
  }));

  const sys = (
    key: string,
    provider: string,
    name: string,
    unit: string,
    category: string,
    url: string,
    status: string,
    responsible: string | null,
    notes: string,
    integration: string,
  ): SystemRecord => ({
    id: `demo-sys-${key}`,
    workspace_id: WS,
    unit_id: unit,
    provider,
    name,
    category,
    external_url: url,
    notes,
    status,
    integration_status: integration,
    capabilities: [],
    config: {},
    responsible_user_id: responsible,
    created_by: DEMO_USER.id,
    created_at: ago(60 * 24 * 70),
  });

  const systems: SystemRecord[] = [
    sys("github", "github", "northwind/web", "demo-unit-infra", "Source control", "https://github.com/", "healthy", "demo-user-2", "Main website repository. Protected main branch, 2 required reviews.", "manual"),
    sys("vercel", "vercel", "Vercel — northwind.com", "demo-unit-infra", "Hosting", "https://vercel.com/dashboard", "degraded", "demo-user-3", "Edge deploys from main. Last build 6m longer than usual.", "manual"),
    sys("aws", "aws", "AWS — prod account", "demo-unit-infra", "Cloud infrastructure", "https://console.aws.amazon.com/", "healthy", "demo-user-2", "RDS, S3 media bucket and background workers.", "manual"),
    sys("cloudflare", "cloudflare", "Cloudflare — DNS & WAF", "demo-unit-infra", "Network", "https://dash.cloudflare.com/", "healthy", "demo-user-3", "DNS, WAF rules and caching for the marketing site.", "manual"),
    sys("stripe", "stripe", "Stripe — Northwind Payments", "demo-unit-funnel", "Payments", "https://dashboard.stripe.com/", "healthy", "demo-user-4", "Subscriptions plus one-off invoices. Webhooks land in the platform API.", "manual"),
    sys("crm", "crm", "CRM — pipeline", "demo-unit-funnel", "Customer data", "https://example.com/crm", "healthy", "demo-user-4", "Deal stages synced nightly from the marketing platform.", "manual"),
    sys("email", "email", "Email platform", "demo-unit-funnel", "Messaging", "https://example.com/email", "maintenance", "demo-user-5", "Lifecycle campaigns. Provider maintenance window Saturday.", "manual"),
    sys("analytics", "analytics", "Product analytics", "demo-unit-funnel", "Analytics", "https://example.com/analytics", "healthy", "demo-user-5", "Funnel and retention dashboards for the revenue team.", "manual"),
    sys("gws", "google_workspace", "Google Workspace", "demo-unit-nyc", "Identity & productivity", "https://admin.google.com/", "healthy", "demo-user-3", "Directory of record for staff accounts and shared drives.", "manual"),
    sys("twilio", "twilio", "Twilio — support line", "demo-unit-nyc", "Communications", "https://console.twilio.com/", "down", "demo-user-3", "Inbound support number and SMS notifications.", "manual"),
    sys("netlify", "netlify", "Netlify — docs site", "demo-unit-launch", "Hosting", "https://app.netlify.com/", "healthy", "demo-user-4", "Static documentation site for the Q4 launch.", "manual"),
    sys("custom", "custom", "Internal Ops API", "demo-unit-launch", "Internal service", "https://example.com/ops", "unknown", null, "Small internal service used for launch checklists.", "manual"),
  ];

  const flows: Flow[] = [
    {
      id: "demo-flow-revenue",
      workspace_id: WS,
      unit_id: "demo-unit-funnel",
      name: "Ads to customer access",
      description: "How a paid visitor becomes a paying customer with access provisioned.",
      created_at: ago(60 * 24 * 50),
    },
    {
      id: "demo-flow-deploy",
      workspace_id: WS,
      unit_id: "demo-unit-infra",
      name: "Website delivery path",
      description: "Code to production, including DNS and edge caching.",
      created_at: ago(60 * 24 * 48),
    },
  ];

  const conn = (
    flow: string,
    from: string,
    to: string,
    label: string,
    position: number,
  ): SystemConnection => ({
    id: id("conn"),
    workspace_id: WS,
    flow_id: flow,
    from_system_id: from,
    to_system_id: to,
    label,
    position,
    created_at: ago(60 * 24 * 45),
  });

  const connections: SystemConnection[] = [
    conn("demo-flow-revenue", "demo-sys-analytics", "demo-sys-crm", "campaign attribution", 0),
    conn("demo-flow-revenue", "demo-sys-crm", "demo-sys-email", "lifecycle sequences", 1),
    conn("demo-flow-revenue", "demo-sys-email", "demo-sys-stripe", "checkout links", 2),
    conn("demo-flow-revenue", "demo-sys-stripe", "demo-sys-gws", "provision access", 3),
    conn("demo-flow-deploy", "demo-sys-github", "demo-sys-vercel", "build on merge", 0),
    conn("demo-flow-deploy", "demo-sys-vercel", "demo-sys-cloudflare", "DNS and caching", 1),
    conn("demo-flow-deploy", "demo-sys-vercel", "demo-sys-aws", "media and workers", 2),
  ];

  const notif = (
    severity: string,
    title: string,
    body: string,
    unit: string | null,
    system: string | null,
    minutes: number,
    resolved = false,
  ): Notification => ({
    id: id("notif"),
    workspace_id: WS,
    unit_id: unit,
    system_id: system,
    severity,
    title,
    body,
    source: "internal",
    external_ref: null,
    payload: {},
    resolved_at: resolved ? ago(minutes - 10) : null,
    created_by: "demo-user-2",
    created_at: ago(minutes),
  });

  const notifications: Notification[] = [
    notif("critical", "Support line not accepting calls", "Twilio inbound number returns a busy signal. Escalated to the provider.", "demo-unit-nyc", "demo-sys-twilio", 22),
    notif("critical", "Payment webhook retries failing", "3 Stripe webhook deliveries failed with 500 responses from the platform API.", "demo-unit-funnel", "demo-sys-stripe", 55),
    notif("warning", "Build times up 40%", "Vercel production builds averaging 6m12s over the last 10 deploys.", "demo-unit-infra", "demo-sys-vercel", 90),
    notif("warning", "Email provider maintenance", "Scheduled maintenance window Saturday 02:00–04:00 UTC.", "demo-unit-funnel", "demo-sys-email", 260),
    notif("info", "New responsible member assigned", "Marc Delacroix is now responsible for Cloudflare DNS.", "demo-unit-infra", "demo-sys-cloudflare", 420),
    notif("info", "Unit created", "Product Launch Q4 unit created with 3 enabled functions.", "demo-unit-launch", null, 900),
    notif("resolved", "S3 media bucket latency", "Elevated latency on media reads cleared after a region failover.", "demo-unit-infra", "demo-sys-aws", 1500, true),
    notif("resolved", "CRM sync backlog", "Nightly sync backlog of 1,240 records processed.", "demo-unit-funnel", "demo-sys-crm", 2600, true),
  ];

  const act = (
    actor: string,
    action: string,
    detail: string,
    unit: string | null,
    system: string | null,
    minutes: number,
  ): ActivityEvent => ({
    id: id("act"),
    workspace_id: WS,
    unit_id: unit,
    system_id: system,
    actor_id: actor,
    action,
    detail,
    created_at: ago(minutes),
  });

  const activity: ActivityEvent[] = [
    act("demo-user-3", "system.status_changed", "Vercel — northwind.com set to degraded", "demo-unit-infra", "demo-sys-vercel", 18),
    act("demo-user-2", "alert.recorded", "Payment webhook retries failing", "demo-unit-funnel", "demo-sys-stripe", 55),
    act("demo-user-4", "system.added", "Netlify — docs site added to Product Launch Q4", "demo-unit-launch", "demo-sys-netlify", 300),
    act("demo-user-2", "member.permissions_updated", "Hana Kim granted alerts.create in Website Infrastructure", "demo-unit-infra", null, 640),
    act(DEMO_USER.id, "unit.created", "Product Launch Q4", "demo-unit-launch", null, 900),
    act("demo-user-4", "flow.updated", "Added Stripe → Google Workspace to Ads to customer access", "demo-unit-funnel", null, 1200),
    act("demo-user-2", "alert.resolved", "S3 media bucket latency", "demo-unit-infra", "demo-sys-aws", 1490),
    act(DEMO_USER.id, "member.invited", "tom.becker@northwind.demo invited as viewer", null, null, 2600),
    act(DEMO_USER.id, "workspace.created", "Northwind Group (demo)", null, null, 60 * 24 * 130),
  ];

  const period = new Date();
  const periodStart = `${period.getUTCFullYear()}-${String(period.getUTCMonth() + 1).padStart(2, "0")}-01`;

  const bill = (
    unit: string | null,
    cents: number,
    payer: string | null,
    status: string,
  ): BillingRecord => ({
    id: id("bill"),
    workspace_id: WS,
    unit_id: unit,
    period_start: periodStart,
    amount_cents: cents,
    currency: "USD",
    payer_user_id: payer,
    status,
    created_at: ago(60 * 24 * 5),
  });

  const billing: BillingRecord[] = [
    bill("demo-unit-infra", 428_000, "demo-user-2", "open"),
    bill("demo-unit-funnel", 261_500, null, "paid"),
    bill("demo-unit-nyc", 97_400, "demo-user-3", "open"),
    bill("demo-unit-launch", 42_000, null, "paid"),
    bill(null, 150_000, DEMO_USER.id, "paid"),
  ];

  store = {
    workspaces: [
      {
        id: WS,
        name: "Northwind Group (demo)",
        owner_id: DEMO_USER.id,
        billing_mode: "central",
        created_at: ago(60 * 24 * 130),
      },
    ],
    workspaceMembers: people.map((p) => ({
      id: id("wm"),
      workspace_id: WS,
      user_id: p.id,
      role: p.role,
      created_at: ago(60 * 24 * 100),
    })),
    profiles: people.map((p) => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      created_at: ago(60 * 24 * 100),
    })),
    units,
    unitMembers,
    systems,
    flows,
    connections,
    notifications,
    activity,
    invitations: [
      {
        id: id("inv"),
        workspace_id: WS,
        unit_id: "demo-unit-funnel",
        email: "dana.wolfe@northwind.demo",
        workspace_role: "editor",
        unit_role: "editor",
        status: "pending",
        invited_by: DEMO_USER.id,
        created_at: ago(180),
      },
    ],
    billing,
  };

  return store;
}

function db(): DemoStore {
  return store ?? seed();
}

/* ------------------------------------------------------------------ reads */

export const demo = {
  listWorkspaces: async (): Promise<Workspace[]> => [...db().workspaces],
  listWorkspaceMembers: async (workspaceId: string) =>
    db().workspaceMembers.filter((m) => m.workspace_id === workspaceId),
  listProfiles: async (ids: string[]) => db().profiles.filter((p) => ids.includes(p.id)),
  listUnits: async (workspaceId: string) => db().units.filter((u) => u.workspace_id === workspaceId),
  listUnitMembers: async (workspaceId: string) =>
    db().unitMembers.filter((m) => m.workspace_id === workspaceId),
  listSystems: async (workspaceId: string) =>
    db().systems.filter((s) => s.workspace_id === workspaceId),
  getSystem: async (systemId: string) => {
    const found = db().systems.find((s) => s.id === systemId);
    if (!found) throw new Error("System not found in the demo workspace");
    return found;
  },
  listNotifications: async (workspaceId: string) =>
    db()
      .notifications.filter((n) => n.workspace_id === workspaceId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at)),
  listActivity: async (workspaceId: string) =>
    db()
      .activity.filter((a) => a.workspace_id === workspaceId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at)),
  listFlows: async (workspaceId: string) => db().flows.filter((f) => f.workspace_id === workspaceId),
  listConnections: async (workspaceId: string) =>
    db()
      .connections.filter((c) => c.workspace_id === workspaceId)
      .sort((a, b) => a.position - b.position),
  listInvitations: async (workspaceId: string) =>
    db().invitations.filter((i) => i.workspace_id === workspaceId),
  listBilling: async (workspaceId: string) =>
    db().billing.filter((b) => b.workspace_id === workspaceId),

  /* ---------------------------------------------------------------- writes */

  createWorkspace: async (name: string) => {
    const workspaceId = id("ws");
    db().workspaces.push({
      id: workspaceId,
      name,
      owner_id: DEMO_USER.id,
      billing_mode: "central",
      created_at: new Date().toISOString(),
    });
    db().workspaceMembers.push({
      id: id("wm"),
      workspace_id: workspaceId,
      user_id: DEMO_USER.id,
      role: "owner",
      created_at: new Date().toISOString(),
    });
    return workspaceId;
  },
  updateWorkspace: async (workspaceId: string, patch: Partial<Workspace>) => {
    patchRow(db().workspaces, workspaceId, patch);
  },
  updateWorkspaceMemberRole: async (rowId: string, role: string) => {
    patchRow(db().workspaceMembers, rowId, { role });
  },
  removeWorkspaceMember: async (rowId: string) => {
    remove(db().workspaceMembers, rowId);
  },

  createUnit: async (input: {
    workspace_id: string;
    name: string;
    purpose?: string | null;
    enabled_functions: string[];
    billing_mode: string;
    payer_user_id?: string | null;
    created_by: string;
  }): Promise<Unit> => {
    const unit: Unit = {
      id: id("unit"),
      workspace_id: input.workspace_id,
      name: input.name,
      purpose: input.purpose ?? null,
      status: "open",
      enabled_functions: input.enabled_functions,
      billing_mode: input.billing_mode,
      payer_user_id: input.payer_user_id ?? null,
      created_by: input.created_by,
      created_at: new Date().toISOString(),
    };
    db().units.push(unit);
    return unit;
  },
  updateUnit: async (unitId: string, patch: Partial<Unit>) => {
    patchRow(db().units, unitId, patch);
  },
  deleteUnit: async (unitId: string) => {
    remove(db().units, unitId);
  },
  addUnitMember: async (input: {
    unit_id: string;
    workspace_id: string;
    user_id: string;
    role: string;
    permissions: string[];
  }) => {
    const existing = db().unitMembers.find(
      (m) => m.unit_id === input.unit_id && m.user_id === input.user_id,
    );
    if (existing) {
      existing.role = input.role;
      existing.permissions = input.permissions;
      return;
    }
    db().unitMembers.push({ id: id("um"), created_at: new Date().toISOString(), ...input });
  },
  updateUnitMember: async (rowId: string, patch: Partial<UnitMember>) => {
    patchRow(db().unitMembers, rowId, patch);
  },
  removeUnitMember: async (rowId: string) => {
    remove(db().unitMembers, rowId);
  },

  createSystem: async (input: {
    workspace_id: string;
    unit_id: string | null;
    provider: string;
    name: string;
    category?: string | null;
    external_url?: string | null;
    notes?: string | null;
    status?: string;
    responsible_user_id?: string | null;
    created_by: string;
  }): Promise<SystemRecord> => {
    const record: SystemRecord = {
      id: id("sys"),
      workspace_id: input.workspace_id,
      unit_id: input.unit_id,
      provider: input.provider,
      name: input.name,
      category: input.category ?? null,
      external_url: input.external_url ?? null,
      notes: input.notes ?? null,
      status: input.status ?? "unknown",
      integration_status: "manual",
      capabilities: [],
      config: {},
      responsible_user_id: input.responsible_user_id ?? null,
      created_by: input.created_by,
      created_at: new Date().toISOString(),
    };
    db().systems.push(record);
    return record;
  },
  updateSystem: async (systemId: string, patch: Partial<SystemRecord>) => {
    patchRow(db().systems, systemId, patch);
  },
  deleteSystem: async (systemId: string) => {
    remove(db().systems, systemId);
  },

  createNotification: async (input: {
    workspace_id: string;
    unit_id: string | null;
    system_id: string | null;
    severity: string;
    title: string;
    body?: string | null;
    created_by: string;
  }) => {
    db().notifications.unshift({
      id: id("notif"),
      workspace_id: input.workspace_id,
      unit_id: input.unit_id,
      system_id: input.system_id,
      severity: input.severity,
      title: input.title,
      body: input.body ?? null,
      source: "internal",
      external_ref: null,
      payload: {},
      resolved_at: null,
      created_by: input.created_by,
      created_at: new Date().toISOString(),
    });
  },
  resolveNotification: async (notificationId: string) => {
    patchRow(db().notifications, notificationId, {
      severity: "resolved",
      resolved_at: new Date().toISOString(),
    });
  },
  logActivity: async (input: {
    workspace_id: string;
    unit_id?: string | null;
    system_id?: string | null;
    actor_id: string;
    action: string;
    detail?: string | null;
  }) => {
    db().activity.unshift({
      id: id("act"),
      workspace_id: input.workspace_id,
      unit_id: input.unit_id ?? null,
      system_id: input.system_id ?? null,
      actor_id: input.actor_id,
      action: input.action,
      detail: input.detail ?? null,
      created_at: new Date().toISOString(),
    });
  },

  createFlow: async (input: {
    workspace_id: string;
    unit_id: string | null;
    name: string;
    description?: string | null;
  }): Promise<Flow> => {
    const flow: Flow = {
      id: id("flow"),
      workspace_id: input.workspace_id,
      unit_id: input.unit_id,
      name: input.name,
      description: input.description ?? null,
      created_at: new Date().toISOString(),
    };
    db().flows.push(flow);
    return flow;
  },
  deleteFlow: async (flowId: string) => {
    remove(db().flows, flowId);
    store!.connections = db().connections.filter((c) => c.flow_id !== flowId);
  },
  createConnection: async (input: {
    workspace_id: string;
    flow_id: string;
    from_system_id: string;
    to_system_id: string;
    label?: string | null;
    position: number;
  }) => {
    db().connections.push({
      id: id("conn"),
      workspace_id: input.workspace_id,
      flow_id: input.flow_id,
      from_system_id: input.from_system_id,
      to_system_id: input.to_system_id,
      label: input.label ?? null,
      position: input.position,
      created_at: new Date().toISOString(),
    });
  },
  deleteConnection: async (connectionId: string) => {
    remove(db().connections, connectionId);
  },

  createInvitation: async (input: {
    workspace_id: string;
    unit_id: string | null;
    email: string;
    workspace_role: string;
    unit_role: string;
    invited_by: string;
  }) => {
    db().invitations.unshift({
      id: id("inv"),
      status: "pending",
      created_at: new Date().toISOString(),
      ...input,
    });
  },
  revokeInvitation: async (invitationId: string) => {
    patchRow(db().invitations, invitationId, { status: "revoked" });
  },
  upsertBillingRecord: async (input: {
    workspace_id: string;
    unit_id: string | null;
    amount_cents: number;
    payer_user_id: string | null;
    status: string;
  }) => {
    const now = new Date();
    db().billing.unshift({
      id: id("bill"),
      workspace_id: input.workspace_id,
      unit_id: input.unit_id,
      period_start: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`,
      amount_cents: input.amount_cents,
      currency: "USD",
      payer_user_id: input.payer_user_id,
      status: input.status,
      created_at: now.toISOString(),
    });
  },
};

/* --------------------------------------------------------------- helpers */

function patchRow<T extends { id: string }>(rows: T[], rowId: string, patch: Partial<T>) {
  const row = rows.find((r) => r.id === rowId);
  if (row) Object.assign(row, patch);
}

function remove<T extends { id: string }>(rows: T[], rowId: string) {
  const index = rows.findIndex((r) => r.id === rowId);
  if (index >= 0) rows.splice(index, 1);
}
