import type { ReactNode } from "react";

export function EditorialPageHeader({ kicker, title, description, children, artwork }: { kicker: string; title: ReactNode; description?: ReactNode; children?: ReactNode; artwork?: ReactNode }) {
  return (
    <header className="page-heading flex flex-wrap items-center justify-between gap-6">
      <div className="page-heading__content">
        <p className="editorial-kicker mb-4">{kicker}</p>
        <h1 className="page-title break-words">{title}</h1>
        {description && <div className="text-[13px] sm:text-sm text-ink-soft max-w-[58ch] mt-5 leading-relaxed">{description}</div>}
        {children && <div className="page-heading__actions">{children}</div>}
      </div>
      {artwork && <div className="page-heading__art">{artwork}</div>}
    </header>
  );
}
