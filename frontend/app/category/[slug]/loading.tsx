// Copyright (c) 2026 Zenith Open Source Projects
// SPDX-License-Identifier: MIT

import { PageShell } from '@/components/layout/PageShell';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CategoryLoadingSkeleton() {
  return (
    <PageShell className="animate-pulse">
      <div className="mb-6 h-4 w-24 bg-rule rounded" />

      <header className="mb-10 pb-8 border-b border-rule">
        <div className="w-12 h-[2px] bg-rule rounded-full mb-5" />
        <div className="h-3 w-16 bg-rule rounded mb-3" />
        <div className="h-10 w-48 bg-rule rounded mb-4" />
        <div className="h-5 w-full max-w-xl bg-rule rounded" />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-[218px] rounded-md" />
        ))}
      </div>
    </PageShell>
  );
}
