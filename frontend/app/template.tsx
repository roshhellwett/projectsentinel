'use client';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="animate-page-enter h-full w-full contain-layout"
      style={{ transform: 'translate3d(0,0,0)' }}
    >
      {children}
    </div>
  );
}
