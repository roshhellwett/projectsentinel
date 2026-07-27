"use client";

import ErrorState from "@/components/ui/ErrorState";

export default function AdminLoginError({
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
      context="the sign-in screen"
      scope="admin-login"
    />
  );
}
