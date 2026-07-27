"use client";

import ErrorState from "@/components/ui/ErrorState";

export default function TermsError({
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
      context="the terms of use"
      scope="terms"
    />
  );
}
