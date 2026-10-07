"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TopicIllustration } from "@/components/visual/TopicIllustration";
import { useI18n } from "@/lib/i18n/i18n-shared";

const TOPICS = [
  { slug: "world", description: "A world beyond the headlines." },
  { slug: "tech", description: "The ideas shaping tomorrow." },
  { slug: "science", description: "A little more wonder." },
  { slug: "business", description: "The bigger economic picture." },
] as const;

export function TopicGallery() {
  const { t } = useI18n();
  return (
    <section className="topic-gallery" aria-label="Explore news perspectives">
      <div className="section-header-premium"><div><span className="section-header-premium__mark">Find your perspective</span><h2>A world to be curious about.</h2></div><span className="hidden sm:inline text-[11px] text-muted">Follow what fascinates you.</span></div>
      <div className="topic-gallery__grid">{TOPICS.map(topic => <Link key={topic.slug} href={`/category/${topic.slug}`} className="topic-gallery__card"><TopicIllustration category={topic.slug} /><div className="topic-gallery__label"><div><h3>{t(`nav.${topic.slug}`)}</h3><p>{topic.description}</p></div><ArrowUpRight size={16} className="text-muted shrink-0" aria-hidden="true" /></div></Link>)}</div>
    </section>
  );
}
