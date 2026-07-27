"use client";

import ErrorState from "@/components/ui/ErrorState";

export default function SearchError({
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
      context="search"
      scope="search"
    />
  );
}
