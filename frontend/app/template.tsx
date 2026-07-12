"use client";

export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-entrance h-full w-full">{children}</div>;
}
