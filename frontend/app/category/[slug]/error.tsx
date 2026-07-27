"use client";

import ErrorState from "@/components/ui/ErrorState";

export default function CategoryError({
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
      context="this category"
      scope="category"
    />
  );
}
