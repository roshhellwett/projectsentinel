"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Fatal error:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-[#fbfbfd] text-[#1a1a2e]">
        <div
          role="alert"
          className="min-h-[100dvh] flex flex-col items-center justify-center px-4 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 border border-red-200 flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3">Critical error</h1>
          <p className="text-muted max-w-md mb-8">
            A critical error occurred. Please try refreshing or come back later.
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#1a1a2e] text-[#fbfbfd] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
              />
            </svg>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
