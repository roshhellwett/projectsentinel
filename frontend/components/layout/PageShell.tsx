import { ReactNode } from 'react';
import { Z_INDEX } from '@/lib/theme/zIndex';

interface PageShellProps {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}

export function PageShell({ children, className = '', narrow = false }: PageShellProps) {
  return (
    <div className={`relative ${Z_INDEX.content} px-4 lg:px-10 pb-16 ${className}`}>
      {narrow ? (
        <div className="max-w-4xl mx-auto">
          <div className="bg-paper/80 backdrop-blur-sm rounded-2xl shadow-[0_4px_30px_-10px_rgb(0_0_0_/_0.12)] border border-paper-2 p-6 md:p-8 lg:p-10">
            {children}
          </div>
        </div>
      ) : (
        <div className="bg-paper/80 backdrop-blur-sm rounded-2xl shadow-[0_4px_30px_-10px_rgb(0_0_0_/_0.12)] border border-paper-2 p-6 md:p-8 lg:p-10">
          {children}
        </div>
      )}
    </div>
  );
}
