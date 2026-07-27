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
      className={`relative px-fluid-md max-[360px]:px-3 pb-24 md:pb-20 ${className}`}
    >
      {pageNumber && (
        <div className="absolute top-0 right-4 sm:right-6 lg:right-10 page-number">
          {pageNumber}
        </div>
      )}
      {narrow ? (
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-fluid-lg border border-rule/50 rounded-token-md">
            {children}
          </div>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto">{children}</div>
      )}
    </div>
  );
}
