import { Post } from '@/types';
import { BookmarkButton } from './BookmarkButton';
import { ShareButtons } from './ShareButtons';
import { SourcePickerButton } from './SourcePickerButton';
import { Z_INDEX } from '@/lib/theme/zIndex';

interface DrawerFooterProps {
  post: Post;
  siteUrl: string;
}

export function DrawerFooter({ post, siteUrl }: DrawerFooterProps) {
  return (
    <footer className={`relative ${Z_INDEX.cardOverlay} flex-shrink-0 border-t border-white/30 dark:border-white/10 bg-transparent px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-3 sm:px-3.5 sm:pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] sm:pt-3.5 lg:px-4 lg:py-3 transform-gpu select-none touch-action-manipulation`}>
      <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.2fr)] gap-2 lg:gap-2.5">
        <BookmarkButton
          postId={post.id}
          variant="pill"
          stopPropagation={false}
          className="w-full justify-center rounded px-2.5 py-2.5 text-xs sm:px-3 sm:py-3 sm:text-sm lg:py-2.5"
        />
        <ShareButtons
          headline={post.headline}
          url={`${siteUrl}/news/${post.id}/`}
          placement="sheet"
          buttonClassName="w-full justify-center rounded px-2.5 py-2.5 text-xs sm:px-3 sm:py-3 sm:text-sm lg:py-2.5"
        />
        <SourcePickerButton
          sources={post.sources}
          label="Sources"
          placement="sheet"
          buttonClassName="w-full justify-center rounded px-2.5 py-2.5 text-xs sm:px-3 sm:py-3 sm:text-sm lg:py-2.5"
          stopPropagation={false}
        />
      </div>
    </footer>
  );
}
