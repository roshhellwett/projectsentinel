// last edited 2026-05-17 by roshhellwett

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div aria-hidden="true" className={`animate-shimmer rounded ${className}`} />
  );
}
