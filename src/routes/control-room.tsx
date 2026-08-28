import { Link, createFileRoute } from "@tanstack/react-router";

import { SiteNav } from "@/components/marketing/SiteNav";
import { Button } from "@/components/ui/button";

const TITLE = "Control Room — TeamStack OWS";
const DESCRIPTION =
  "Control Room uses the integrations already connected to TeamStack OWS to run actions, rules, workflows, and automations across those platforms. It can connect one platform’s API to another, trigger actions between systems, and automate operations both across external platforms and within TeamStack OWS.";

export const Route = createFileRoute("/control-room")({
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
  component: ControlRoomPage,
});

const POINTS = [
  {
    title: "Operations across platforms",
    body: "Use your connected systems together instead of operating each platform separately, allowing actions and information to move between them through TeamStack OWS.",
  },
  {
    title: "More than an operating dashboard",
    body: "Control Room goes beyond viewing and organizing operations by allowing TeamStack OWS to actively carry out supported actions across the platforms you have connected.",
  },
  {
    title: "Workflows, rules, and automation",
    body: "Create triggers, rules, and workflows that can move from one API or connected platform to another, or automate actions entirely within TeamStack OWS.",
  },
  {
    title: "The question it answers",
    body: "\u201CWhat should happen across my connected platforms, and how can TeamStack OWS make it happen automatically?\u201D",
  },
];

function ControlRoomPage() {
  return (
    <main className="min-h-screen w-full bg-background">
      <div className="min-h-screen w-full max-w-none overflow-hidden bg-background">
        <SiteNav />
        <section className="px-4 pt-10 pb-6 text-center lg:px-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-brand uppercase">
            <span className="size-1.5 rounded-full bg-brand" />
            Control Room
          </span>
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
            Automate and control operations across connected platforms
          </h1>
          <p className="mx-auto mt-4 max-w-[60ch] text-[16px] leading-relaxed text-muted-foreground">
            Control Room uses the integrations already connected to TeamStack OWS to run actions,
            rules, workflows, and automations across those platforms. It can connect one platform’s
            API to another, trigger actions between systems, and automate operations both across
            external platforms and within TeamStack OWS.
          </p>
        </section>

        <section className="grid gap-4 px-4 pb-8 lg:grid-cols-2 lg:px-16">
          {POINTS.map((point) => (
            <article key={point.title} className="rounded-xl border bg-card p-5">
              <h2 className="text-[15px] font-semibold">{point.title}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{point.body}</p>
            </article>
          ))}
        </section>

        <section className="px-4 pb-12 text-center lg:px-16">
          <Button asChild size="lg" className="rounded-lg px-6">
            <Link to="/auth">Open your workspace</Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
