import { ReactNode } from 'react';
import { Z_INDEX } from '@/lib/theme/zIndex';

interface PageShellProps {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}

export function PageShell({ children, className = '', narrow = false }: PageShellProps) {
  return (
    <div className={`relative ${Z_INDEX.content} px-4 sm:px-6 lg:px-10 pb-24 md:pb-20 ${className}`}>
      {narrow ? (
        <div className="max-w-4xl mx-auto">
          <div className="glass-xl rounded-2xl shadow-[0_4px_30px_-10px_rgb(0_0_0_/_0.12)] p-6 md:p-8 lg:p-10">
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
