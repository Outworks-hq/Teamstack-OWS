import { Link, createFileRoute } from "@tanstack/react-router";

import { ProviderMark } from "@/components/brand/ProviderMark";
import { SiteNav } from "@/components/marketing/SiteNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CAPABILITY_LABELS, PROVIDERS, WEDGE_PROVIDER_IDS } from "@/lib/ows/providers";

const TITLE = "Integrations — TeamStack OWS system catalog";
const DESCRIPTION =
  "Organize AWS, Stripe, GitHub, Vercel, Google Workspace, Twilio, Netlify, Cloudflare, CRM and custom systems in TeamStack OWS, with an extensible connector architecture for deeper API access.";

export const Route = createFileRoute("/integrations")({
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
  component: IntegrationsPage,
});

function IntegrationsPage() {
  return (
    <main className="min-h-screen w-full bg-background">
      <div className="min-h-screen w-full max-w-none overflow-hidden bg-background">
        <SiteNav />
        <section className="px-4 pt-10 pb-6 text-center lg:px-16">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Integrations</h1>
          <p className="mx-auto mt-4 max-w-[62ch] text-[16px] leading-relaxed text-muted-foreground">
            Every system can be organized in OWS today — named, assigned to a Unit, categorized,
            linked to its real dashboard, and given a responsible owner. Deeper API connectors slot
            into the same records without changing the interface.
          </p>
        </section>

        <section className="grid gap-4 px-4 pb-8 sm:grid-cols-2 lg:grid-cols-3 lg:px-16">
          {PROVIDERS.map((provider) => (
            <article key={provider.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-3">
                <ProviderMark providerId={provider.id} />
                <div>
                  <h2 className="text-[14px] font-semibold">{provider.label}</h2>
                  <p className="text-[12px] text-muted-foreground">{provider.category}</p>
                </div>
                {WEDGE_PROVIDER_IDS.includes(provider.id) && (
                  <Badge className="ml-auto shrink-0 text-[10px]">First wedge</Badge>
                )}
              </div>
              <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Planned connector surface
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {provider.plannedCapabilities.map((capability) => (
                  <li
                    key={capability}
                    className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {CAPABILITY_LABELS[capability]}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="px-4 pb-12 text-center lg:px-16">
          <Button asChild size="lg" className="rounded-lg px-6">
            <Link to="/auth">Start organizing your systems</Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
