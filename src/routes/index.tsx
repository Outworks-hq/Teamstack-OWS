import { Link, createFileRoute } from "@tanstack/react-router";
import { CirclePlay } from "lucide-react";

import { DashboardPreview } from "@/components/marketing/DashboardPreview";
import { SiteNav } from "@/components/marketing/SiteNav";
import { Button } from "@/components/ui/button";

const TITLE = "TeamStack OWS — One workspace. Every system. Clear control.";
const DESCRIPTION =
  "TeamStack OWS is the operations workspace where teams monitor, understand, and control connected backends across AWS, Stripe, GitHub, Vercel, Twilio, Netlify, and Google Workspace.";

export const Route = createFileRoute("/")({
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
  component: Home,
});

function Home() {
  return (
    <main className="min-h-screen w-full bg-background">
      <div className="min-h-screen w-full max-w-none overflow-hidden bg-background">
        <SiteNav />

        <section className="px-4 pt-8 pb-10 text-center lg:px-16 lg:pt-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-brand uppercase">
            <span className="size-1.5 rounded-full bg-brand" />
            Operations workspace for modern teams
          </span>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl lg:text-6xl">
            One workspace.
            <br />
            Every system. <span className="text-brand">Clear control.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-[54ch] text-[17px] leading-relaxed text-muted-foreground">
            TeamStack OWS lets teams monitor, understand, and control connected backends across AWS,
            Stripe, GitHub, Vercel, Twilio, Netlify, and Google Workspace from one clean place.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            <Button asChild size="lg" className="rounded-lg px-6">
              <Link to="/auth">
                Book a demo <span aria-hidden="true">→</span>
              </Link>
            </Button>
            <Link
              to="/product"
              className="inline-flex items-center gap-2 text-[15px] font-medium transition-colors hover:text-brand"
            >
              See how it works <CirclePlay className="size-4" />
            </Link>
          </div>
        </section>

        <section className="px-3 pb-4 lg:px-8 lg:pb-8">
          <DashboardPreview />
        </section>
      </div>
    </main>
  );
}
