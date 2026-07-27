import { PageShell } from "@/components/layout/PageShell";

export interface RouteSkeletonProps {
  /** Renders the narrow, card-framed reading column used by legal/info pages. */
  narrow?: boolean;
  /** Number of body paragraph blocks to shim in. */
  blocks?: number;
  /** Renders a card grid below the header instead of prose blocks. */
  grid?: boolean;
}

/**
 * Themed placeholder shown while a route segment streams in.
 * Mirrors the real page rhythm so navigation never flashes an empty frame.
 */
export function RouteSkeleton({
  narrow = false,
  blocks = 4,
  grid = false,
}: RouteSkeletonProps) {
  return (
    <PageShell narrow={narrow}>
      <div
        className="animate-pulse pt-fluid-md"
        role="status"
        aria-label="Loading"
      >
        <div className="w-12 h-[2px] bg-accent rounded-full mb-fluid-sm" />
        <div className="h-3 w-24 bg-rule/60 rounded-token-sm mb-fluid-xs" />
        <div className="h-10 w-2/3 max-w-sm bg-rule/60 rounded-token-sm mb-fluid-sm" />
        <div className="h-4 w-full max-w-prose-fluid bg-rule/40 rounded-token-sm mb-fluid-lg" />

        {grid ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-fluid-sm">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-56 bg-rule/30 rounded-token-md border border-rule/50"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-fluid-md max-w-prose-fluid">
            {Array.from({ length: blocks }).map((_, i) => (
              <div key={i} className="space-y-fluid-2xs">
                <div className="h-5 w-40 bg-rule/60 rounded-token-sm mb-fluid-xs" />
                <div className="h-3.5 w-full bg-rule/35 rounded-token-sm" />
                <div className="h-3.5 w-full bg-rule/35 rounded-token-sm" />
                <div className="h-3.5 w-4/5 bg-rule/35 rounded-token-sm" />
              </div>
            ))}
          </div>
        )}
      </div>
      <span className="sr-only">Loading page content</span>
    </PageShell>
  );
}

export default RouteSkeleton;
