// Copyright (c) 2026 Zenith Open Source Projects
// SPDX-License-Identifier: MIT

export default function CategoryLoadingSkeleton() {
  return (
    <div className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full animate-pulse">
      <div className="mb-10 text-center flex flex-col items-center">
        <div className="h-4 w-24 bg-rule rounded mb-4" />
        <div className="h-10 w-48 bg-rule rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col gap-4 border border-rule p-4 rounded-xl">
            <div className="w-full aspect-[16/10] bg-rule rounded-lg" />
            <div className="space-y-2">
              <div className="h-6 w-full bg-rule rounded" />
              <div className="h-6 w-[80%] bg-rule rounded" />
            </div>
            <div className="h-4 w-32 bg-rule rounded mt-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
