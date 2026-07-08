'use client';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-slide-up h-full w-full">
      {children}
    </div>
  );
}
