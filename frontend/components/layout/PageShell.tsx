import { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
  pageNumber?: string;
}

export function PageShell({
  children,
  className = "",
  narrow = false,
  pageNumber,
}: PageShellProps) {
  return (
    <div
      className={`page-shell site-container relative ${className}`}
    >
      {pageNumber && (
        <div className="absolute top-0 right-4 sm:right-6 lg:right-10 page-number">
          {pageNumber}
        </div>
      )}
      {narrow ? (
        <div className="max-w-3xl mx-auto">
          <div className="py-2 sm:py-5">
            {children}
          </div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}
