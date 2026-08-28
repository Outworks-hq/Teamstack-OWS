import { Link, createFileRoute } from "@tanstack/react-router";

import { SiteNav } from "@/components/marketing/SiteNav";
import { Button } from "@/components/ui/button";

const TITLE = "Console — TeamStack OWS";
const DESCRIPTION =
  "Console is the unified day-to-day operating dashboard for the platforms connected to TeamStack OWS — monitor what's happening, understand status, and take direct action in one place.";

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
    body: "Console brings information from your connected platforms — AWS, Stripe, GitHub, Vercel, Twilio, Netlify, Google Workspace — into a single view, so your team stops jumping between separate platform dashboards.",
  },
  {
    title: "Understand what's happening",
    body: "See warnings, status, billing and usage, and access information for everything connected to a Unit, summarized in plain language.",
  },
  {
    title: "Take direct action",
    body: "Console is not view-only. Where permissions allow, teams take normal, direct operational actions from Console itself.",
  },
  {
    title: "The question it answers",
    body: "\u201CWhat is happening across my connected systems, and what direct action do I need to take?\u201D",
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
            The unified day-to-day operating dashboard
          </h1>
          <p className="mx-auto mt-4 max-w-[60ch] text-[16px] leading-relaxed text-muted-foreground">
            Console is the everyday operating view for the platforms connected to TeamStack OWS. It
            brings everything into one place so teams can monitor what is happening, understand
            warnings and status, see billing/usage and access information, and take normal direct
            actions — without constantly jumping between separate platform dashboards.
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
