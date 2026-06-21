// Copyright (c) 2026 Zenith Open Source Projects
// SPDX-License-Identifier: MIT

export default function ArticleLoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
      {/* Kicker & Source */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-4 w-24 bg-rule rounded" />
        <div className="h-4 w-4 rounded-full bg-rule" />
        <div className="h-4 w-32 bg-rule rounded" />
      </div>

      {/* Title */}
      <div className="space-y-3 mb-8">
        <div className="h-10 w-full bg-rule rounded-md" />
        <div className="h-10 w-[85%] bg-rule rounded-md" />
      </div>

      {/* Hero Image */}
      <div className="w-full aspect-[16/10] bg-rule rounded-xl mb-8" />

      {/* Content */}
      <div className="space-y-4">
        <div className="h-4 w-full bg-rule rounded" />
        <div className="h-4 w-[95%] bg-rule rounded" />
        <div className="h-4 w-[90%] bg-rule rounded" />
        <div className="h-4 w-full bg-rule rounded" />
        <div className="h-4 w-[85%] bg-rule rounded" />
      </div>
      
      <div className="space-y-4 mt-8">
        <div className="h-4 w-[92%] bg-rule rounded" />
        <div className="h-4 w-full bg-rule rounded" />
        <div className="h-4 w-[88%] bg-rule rounded" />
      </div>
    </div>
  );
}
