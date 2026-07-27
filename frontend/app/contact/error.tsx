"use client";

import ErrorState from "@/components/ui/ErrorState";

export default function ContactError({
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
      context="the contact page"
      scope="contact"
    />
  );
}
