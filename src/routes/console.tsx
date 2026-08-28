import { Link, createFileRoute } from "@tanstack/react-router";

import { SiteNav } from "@/components/marketing/SiteNav";
import { Button } from "@/components/ui/button";

const TITLE = "Console — TeamStack OWS";
const DESCRIPTION =
  "Console brings your connected platforms together inside TeamStack OWS, giving you one place to see what is happening, organize how systems connect across your Units, review warnings, usage, billing, access, and activity, and manage your day-to-day operations without jumping between separate dashboards.";

export const Route = createFileRoute("/console")({
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
  component: ConsolePage,
});

const POINTS = [
  {
    title: "One place for the day-to-day",
    body: "Bring information from AWS, Stripe, GitHub, Vercel, Twilio, Google Workspace, and other connected platforms into one organized operating view.",
  },
  {
    title: "Understand what’s happening",
    body: "See system status, warnings, usage, billing, access, activity, and other important information across everything connected to a Unit.",
  },
  {
    title: "Organize and manage inside OWS",
    body: "Control how connected systems are organized, related, and managed within TeamStack OWS, while handling normal day-to-day actions from one place.",
  },
  {
    title: "The question it answers",
    body: "\u201CWhat is happening across my operations, and how is everything organized and connected inside TeamStack OWS?\u201D",
  },
];

function ConsolePage() {
  return (
    <main className="min-h-screen w-full bg-background">
      <div className="min-h-screen w-full max-w-none overflow-hidden bg-background">
        <SiteNav />
        <section className="px-4 pt-10 pb-6 text-center lg:px-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-brand uppercase">
            <span className="size-1.5 rounded-full bg-brand" />
            Console
          </span>
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
            One place to view, organize, and manage your operations
          </h1>
          <p className="mx-auto mt-4 max-w-[60ch] text-[16px] leading-relaxed text-muted-foreground">
            Console brings your connected platforms together inside TeamStack OWS, giving you one
            place to see what is happening, organize how systems connect across your Units, review
            warnings, usage, billing, access, and activity, and manage your day-to-day operations
            without jumping between separate dashboards.
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
