import { cn } from "@/lib/utils/cn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-sm bg-paper-2 border border-rule",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
