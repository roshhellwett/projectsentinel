'use client';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-entrance h-full w-full" style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
