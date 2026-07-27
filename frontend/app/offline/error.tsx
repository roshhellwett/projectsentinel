"use client";

import ErrorState from "@/components/ui/ErrorState";

export default function OfflineError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      context="the offline page"
      scope="offline"
    />
  );
}
