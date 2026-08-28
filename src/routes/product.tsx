import { Link, createFileRoute } from "@tanstack/react-router";

import { SiteNav } from "@/components/marketing/SiteNav";
import { Button } from "@/components/ui/button";

const TITLE = "How TeamStack OWS works — Workspaces, Units, Systems";
const DESCRIPTION =
  "TeamStack OWS organizes your company's platforms into one operating layer: Workspaces for the organization, customizable Units for how you actually operate, and Systems for every external platform.";

export const Route = createFileRoute("/product")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

const STEPS = [
  {
    title: "Workspace",
    body: "One Workspace represents one organization. The creator becomes the Workspace owner, and a person can create or belong to several independent Workspaces.",
  },
  {
    title: "Units",
    body: "Units are fully customizable. Name and configure them around how your organization operates — a team, a location, a client, a launch, or a piece of infrastructure. Departments are only examples, never fixed types.",
  },
  {
    title: "Members & permissions",
    body: "Workspace Owner, Unit Admin, Editor, Viewer, plus custom permissions. Non-admins can still act where their permissions allow it.",
  },
  {
    title: "Systems",
    body: "Add AWS, Stripe, GitHub, Vercel, Google Workspace, Twilio, Netlify, Cloudflare, your CRM, or any custom system. Assign a Unit, an owner, a category, notes and its real dashboard URL.",
  },
  {
    title: "Console & Control Room",
    body: "Console is the everyday operations view. Control Room is the deeper view for critical alerts, incidents, health, access logs and recovery.",
  },
  {
    title: "Connected Operations",
    body: "Map how systems work together — Ads → Website → CRM → Email → Stripe → Customer access — and name each relationship.",
  },
];

function ProductPage() {
  return (
    <main className="min-h-screen w-full bg-background">
      <div className="min-h-screen w-full max-w-none overflow-hidden bg-background">
        <SiteNav />
        <section className="px-4 pt-10 pb-6 text-center lg:px-16">
          <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
            One organized operating layer over the platforms you already use
          </h1>
          <p className="mx-auto mt-4 max-w-[60ch] text-[16px] leading-relaxed text-muted-foreground">
            TeamStack OWS does not replace AWS, Stripe, GitHub or Vercel. It gives your team one
            clean place to organize, monitor and understand them.
          </p>
        </section>

        <section className="grid gap-4 px-4 pb-8 lg:grid-cols-3 lg:px-16">
          {STEPS.map((step, index) => (
            <article
              key={step.title}
              id={step.title === "Console & Control Room" ? "console" : undefined}
              className="scroll-mt-24 rounded-xl border bg-card p-5"
            >
              {step.title === "Console & Control Room" && <span id="control-room" />}
              <span className="text-[11px] font-semibold tracking-[0.12em] text-brand uppercase">
                Step {index + 1}
              </span>
              <h2 className="mt-2 text-[15px] font-semibold">{step.title}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{step.body}</p>
            </article>
          ))}
        </section>

        <section className="px-4 pb-12 text-center lg:px-16">
          <Button asChild size="lg" className="rounded-lg px-6">
            <Link to="/auth">Create your workspace</Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
