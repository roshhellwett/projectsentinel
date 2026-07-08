'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bookmark, ArrowLeft, Trash2 } from 'lucide-react';
import { Post } from '@/types';
import { NewsCard } from '@/components/news/NewsCard';
import { FeedSkeleton } from '@/components/news/InfiniteFeed';
import { useReadPosts, useSavedPosts } from '@/lib/utils/readPosts';
import { showToast } from '@/lib/utils/toast';
import { PageShell } from '@/components/layout/PageShell';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import dynamic from 'next/dynamic';

const NewsDrawer = dynamic(() => import('@/components/news/NewsDrawer').then(m => m.NewsDrawer), { ssr: false });
import { Z_INDEX } from '@/lib/theme/zIndex';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/utils/bodyScrollLock';
import { useI18n } from '@/lib/i18n/i18n-shared';
import { cachedFetch } from '@/lib/utils/fetchCache';

export default function SavedPage() {
  const { t } = useI18n();
  const { savedIds, clearSaved } = useSavedPosts();
  const { readIds, markRead } = useReadPosts();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Post | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    if (!confirmingClear) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [confirmingClear]);

  const idList = useMemo(() => Array.from(savedIds).reverse(), [savedIds]);

  useEffect(() => {
    if (idList.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    cachedFetch<{ posts: Post[] }>('/api/posts/batch/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: idList }),
      signal: controller.signal,
      cacheTtl: 300_000,
    })
      .then((data) => {
        setPosts(Array.isArray(data.posts) ? data.posts : []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(t('saved.load_error'));
        setLoading(false);
      });

    return () => controller.abort();
  }, [idList, t]);

  const handleOpen = (post: Post) => {
    markRead(post.id);
    setSelected(post);
  };

  return (
    <div className="relative min-h-screen">
      <PageShell>
        <Link
          href="/"
          className="tap-target min-h-[44px] inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink mb-6 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded border border-rule bg-paper group-hover:border-ink transition-all hover-lift">
            <ArrowLeft className="w-4 h-4" />
          </span>
          {t('saved.back')}
        </Link>

        <div className="animate-slide-up mb-6 sm:mb-10 pb-5 sm:pb-8 border-b border-rule flex flex-wrap items-end justify-between gap-4">
          <div>
            <span aria-hidden="true" className="block w-10 h-[2px] bg-accent rounded-full mb-3 sm:mb-5" />
            <p className="editorial-kicker mb-1.5 sm:mb-3">{t('saved.your_list')}</p>
            <h1 className="font-display text-xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] text-ink mb-1.5 sm:mb-3 leading-[1.05]">
              {t('saved.page_title')}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted max-w-xl leading-relaxed">
              {t('saved.page_desc')}
            </p>
          </div>
          {idList.length > 0 && (
            <button
              onClick={() => setConfirmingClear(true)}
              className="tap-target min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded border border-rule-strong text-sm font-medium text-ink hover:border-ink hover:bg-paper-2 transition-all hover-lift active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={t('saved.clear_all_aria')}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('saved.clear_all')}
            </button>
          )}
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 items-stretch">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <FeedSkeleton />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-center text-red-500 py-12">{error}</p>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-full border border-rule flex items-center justify-center mb-5" style={{ backgroundColor: 'rgb(var(--c-paper-2))' }}>
              <Bookmark className="w-7 h-7 text-muted" />
            </div>
            <h2 className="font-display text-lg font-bold text-ink tracking-[-0.015em] mb-1.5">
              {t('saved.empty_title')}
            </h2>
            <p className="text-sm text-muted max-w-sm mb-6">
              {t('saved.empty_desc')}
            </p>
            <Link
              href="/"
              className="tap-target min-h-[44px] inline-flex items-center gap-2 px-4 pt-[9px] pb-[11px] rounded border border-ink bg-ink text-paper text-sm font-semibold hover:bg-ink/90 transition-all hover-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t('saved.browse_latest')}
            </Link>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <ErrorBoundary>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 items-stretch">
              {posts.map((post) => (
                <NewsCard
                  key={post.id}
                  post={post}
                  onClick={() => handleOpen(post)}
                  isRead={readIds.has(post.id)}
                />
              ))}
            </div>
          </ErrorBoundary>
        )}

        <NewsDrawer
          post={selected}
          onClose={() => setSelected(null)}
          onSelectRelated={(next) => {
            markRead(next.id);
            setSelected(next);
          }}
        />
      </PageShell>

      {confirmingClear && (
        <div className={`fixed inset-0 ${Z_INDEX.modalBackdrop} flex items-center justify-center px-4`}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={() => setConfirmingClear(false)} />
          <div
            className="animate-scale-in relative bg-paper-tint border border-rule p-6 w-full max-w-sm"
            role="alertdialog"
            aria-label={t('saved.confirm_aria')}
          >
            <h3 className="font-display text-lg font-bold text-ink mb-2">{t('saved.confirm_title')}</h3>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              {t('saved.confirm_desc')}
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setConfirmingClear(false)}
                className="tap-target min-h-[44px] inline-flex items-center justify-center px-4 py-2 rounded border border-rule-strong text-sm font-medium text-ink hover:border-ink hover:bg-paper-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  clearSaved();
                  showToast(t('saved.cleared_msg'), 'success');
                  setConfirmingClear(false);
                }}
                className="tap-target min-h-[44px] inline-flex items-center justify-center px-4 py-2 rounded border border-transparent bg-like text-white text-sm font-semibold hover:bg-like/90 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t('saved.clear_all')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
