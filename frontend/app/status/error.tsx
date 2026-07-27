"use client";

import ErrorState from "@/components/ui/ErrorState";

export default function StatusError({
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
      context="the status desk"
      scope="status"
    />
  );
}
