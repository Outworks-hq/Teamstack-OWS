import { getProvider } from "@/lib/ows/providers";
import { cn } from "@/lib/utils";

/**
 * Provider tile. Uses the provider's literal brand colour via inline style
 * (third-party marks are not part of the design token system).
 */
export function ProviderMark({
  providerId,
  className,
}: {
  providerId: string;
  className?: string | undefined;
}) {
  const provider = getProvider(providerId);
  const initials = provider.label
    .split(/[\s_]+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border text-[11px] font-semibold",
        className,
      )}
      style={{
        color: provider.color,
        backgroundColor: `${provider.color}12`,
        borderColor: `${provider.color}26`,
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function ProviderWordmark({ providerId }: { providerId: string }) {
  const provider = getProvider(providerId);
  return (
    <span className="flex items-center gap-2">
      <ProviderMark providerId={providerId} className="size-6 rounded-md text-[10px]" />
      <span className="text-[15px] font-semibold tracking-tight" style={{ color: provider.color }}>
        {provider.label}
      </span>
    </span>
  );
}
