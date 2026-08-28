import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-6 text-brand", className)}
    >
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h1A2.5 2.5 0 0 1 10 6.5v1A2.5 2.5 0 0 1 7.5 10h-1A2.5 2.5 0 0 1 4 7.5v-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M14 6.5A2.5 2.5 0 0 1 16.5 4h1A2.5 2.5 0 0 1 20 6.5v1A2.5 2.5 0 0 1 17.5 10h-1A2.5 2.5 0 0 1 14 7.5v-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M4 16.5A2.5 2.5 0 0 1 6.5 14h1A2.5 2.5 0 0 1 10 16.5v1A2.5 2.5 0 0 1 7.5 20h-1A2.5 2.5 0 0 1 4 17.5v-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M14 16.5A2.5 2.5 0 0 1 16.5 14h1A2.5 2.5 0 0 1 20 16.5v1A2.5 2.5 0 0 1 17.5 20h-1A2.5 2.5 0 0 1 14 17.5v-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function Wordmark({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      <span className="text-[17px] font-semibold tracking-tight">
        TeamStack <span className="font-normal tracking-normal text-muted-foreground">OWS</span>
      </span>
    </span>
  );
}
