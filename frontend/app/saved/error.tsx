"use client";

import ErrorState from "@/components/ui/ErrorState";

export default function SavedError({
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
      context="your saved stories"
      scope="saved"
    />
  );
}
