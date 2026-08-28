import { Link } from "@tanstack/react-router";

import { Wordmark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

const NAV = [
  { label: "Product", to: "/product" },
  { label: "Console", to: "/app/console" },
  { label: "Control Room", to: "/app/control-room" },
  { label: "Integrations", to: "/integrations" },
  { label: "Pricing", to: "/pricing" },
] as const;

export function SiteNav() {
  return (
    <header className="flex items-center justify-between px-6 py-6 lg:px-10 lg:py-7">
      <Link to="/" aria-label="TeamStack OWS home">
        <Wordmark />
      </Link>

      <nav className="hidden items-center gap-8 lg:flex">
        {NAV.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="text-[15px] text-foreground/80 transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground font-medium" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="hidden text-[14px] sm:inline-flex">
          <Link to="/auth">Sign in</Link>
        </Button>
        <Button asChild className="rounded-lg px-4 text-[14px] font-medium">
          <Link to="/auth">Book a demo</Link>
        </Button>
      </div>
    </header>
  );
}
