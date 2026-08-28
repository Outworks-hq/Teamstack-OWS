import { Link, createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { SiteNav } from "@/components/marketing/SiteNav";
import { Button } from "@/components/ui/button";

const TITLE = "Pricing — TeamStack OWS billing by Unit, not per seat";
const DESCRIPTION =
  "TeamStack OWS does not charge per seat. Billing responsibility belongs to each Unit's assigned payer, either covered centrally by the Workspace owner or billed to the Unit.";

export const Route = createFileRoute("/pricing")({
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
  component: PricingPage,
});

const PLANS = [
  {
    name: "Central billing",
    summary: "The Workspace owner covers every Unit.",
    points: [
      "One payer for the whole organization",
      "Unlimited members at no per-seat charge",
      "Unit-level usage still reported separately",
      "Best for a single finance owner",
    ],
  },
  {
    name: "Unit billing",
    summary: "Each Unit admin is responsible for their own Unit.",
    points: [
      "Billing responsibility assigned per Unit",
      "Unit admins see their own Unit spend",
      "Members participate without being charged",
      "Best for agencies, clients and divisions",
    ],
  },
];

function PricingPage() {
  return (
    <main className="min-h-screen w-full bg-background">
      <div className="min-h-screen w-full max-w-none overflow-hidden bg-background">
        <SiteNav />
        <section className="px-4 pt-10 pb-6 text-center lg:px-16">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Not per seat. Per <span className="text-brand">responsibility</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-[58ch] text-[16px] leading-relaxed text-muted-foreground">
            Regular members participate without being charged directly. Billing responsibility
            belongs to the payer assigned to each Unit.
          </p>
        </section>

        <section className="mx-auto grid max-w-4xl gap-4 px-4 pb-8 sm:grid-cols-2 lg:px-16">
          {PLANS.map((plan) => (
            <article key={plan.name} className="rounded-xl border bg-card p-6">
              <h2 className="text-[16px] font-semibold">{plan.name}</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">{plan.summary}</p>
              <ul className="mt-4 space-y-2">
                {plan.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-[13px]">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="px-4 pb-12 text-center lg:px-16">
          <Button asChild size="lg" className="rounded-lg px-6">
            <Link to="/auth">Book a demo</Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
