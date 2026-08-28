import { Link, createFileRoute } from "@tanstack/react-router";

import { SiteNav } from "@/components/marketing/SiteNav";
import { Button } from "@/components/ui/button";

const TITLE = "Control Room — TeamStack OWS";
const DESCRIPTION =
  "Control Room is where teams create and manage operations that work across their connected platforms — rules, automations, flows, and coordinated actions between systems.";

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
    body: "Control Room uses the systems connected through TeamStack OWS to create rules, automations, flows, and coordinated actions between them.",
  },
  {
    title: "More than monitoring",
    body: "Control Room is not simply a more advanced monitoring dashboard. Its distinction is cross-platform operational control — deciding how connected systems should work together.",
  },
  {
    title: "Workflows, rules, automation",
    body: "Define what should happen automatically or across systems: connect triggers and actions between platforms instead of handling each one in isolation.",
  },
  {
    title: "The question it answers",
    body: "\u201CHow should these connected systems work together, and what should happen automatically or across them?\u201D",
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
            Cross-platform operational control
          </h1>
          <p className="mx-auto mt-4 max-w-[60ch] text-[16px] leading-relaxed text-muted-foreground">
            Control Room is where teams create and manage operations that work across their
            connected platforms. It uses the systems connected through TeamStack OWS to create
            rules, automations, flows, and coordinated actions between them.
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
