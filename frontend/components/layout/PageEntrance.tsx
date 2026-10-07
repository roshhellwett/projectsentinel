"use client";

import { type ReactNode } from "react";

export function PageEntrance({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      {children}
    </div>
  );
}
