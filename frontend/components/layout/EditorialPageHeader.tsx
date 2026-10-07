import type { ReactNode } from "react";

export function EditorialPageHeader({ kicker, title, description, children }: { kicker: string; title: ReactNode; description?: ReactNode; children?: ReactNode }) {
  return (
    <header className="page-heading flex flex-wrap items-end justify-between gap-6">
      <div className="min-w-0 max-w-4xl">
        <p className="editorial-kicker mb-4">{kicker}</p>
        <h1 className="page-title break-words">{title}</h1>
        {description && <div className="text-[13px] sm:text-sm text-ink-soft max-w-[58ch] mt-5 leading-relaxed">{description}</div>}
      </div>
      {children}
    </header>
  );
}
