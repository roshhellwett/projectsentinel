import { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
  pageNumber?: string;
}

export function PageShell({ children, className = '', narrow = false, pageNumber }: PageShellProps) {
  return (
    <div className={`relative px-4 sm:px-6 lg:px-10 pb-24 md:pb-20 ${className}`}>
      {pageNumber && (
        <div className="absolute top-0 right-4 sm:right-6 lg:right-10 page-number">
          {pageNumber}
        </div>
      )}
      {narrow ? (
        <div className="max-w-3xl mx-auto">
          <div className="ink-card p-6 md:p-8 lg:p-10">
            {children}
          </div>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      )}
    </div>
  );
}
