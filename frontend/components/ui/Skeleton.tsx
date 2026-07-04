interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div aria-hidden="true" className={`animate-shimmer bg-paper-2 rounded will-change-transform transform-gpu ${className}`} />
  );
}
