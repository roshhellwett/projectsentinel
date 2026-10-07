"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/constants/categories";
import { useI18n } from "@/lib/i18n/i18n-shared";
import { CategoryIcon } from "@/components/visual/MaterialIcon";

export function TopicIndex() {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <nav className="topic-index" aria-label="News topics">
      <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>All stories <span aria-hidden="true">↗</span></Link>
      {CATEGORIES.map(({ slug }) => (
        <Link key={slug} href={`/category/${slug}`} aria-current={pathname.replace(/\/$/, "") === `/category/${slug}` ? "page" : undefined}>
          <CategoryIcon category={slug} size="xs" />
          {t(`nav.${slug}`)}
        </Link>
      ))}
    </nav>
  );
}
