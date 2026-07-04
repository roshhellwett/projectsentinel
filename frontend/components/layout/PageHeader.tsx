import { ReactNode } from 'react';

interface PageHeaderProps {
  kicker: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ kicker, title, description, children }: PageHeaderProps) {
  return (
    <header className="mb-10 pb-8 border-b border-rule animate-fade-in-up">
      <span aria-hidden="true" className="block w-12 h-[2px] bg-accent rounded-full mb-5" />
      <p className="editorial-kicker mb-3">{kicker}</p>
      <h1 className="font-display text-4xl md:text-5xl font-bold text-ink tracking-[-0.03em] mb-3 leading-[1.05]">
        {title}
      </h1>
      {description && (
        <p className="text-sm md:text-base text-muted max-w-xl leading-relaxed">{description}</p>
      )}
      {children}
    </header>
  );
}
