import { Post } from "@/types";
import { BookmarkButton } from "./BookmarkButton";
import { ShareButtons } from "./ShareButtons";
import { SourcePickerButton } from "./SourcePickerButton";

interface DrawerFooterProps {
  post: Post;
  siteUrl: string;
}

export function DrawerFooter({ post, siteUrl }: DrawerFooterProps) {
  return (
    <footer className="flex-shrink-0 border-t border-rule bg-paper-2 px-2 sm:px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-2 sm:pt-3 overflow-hidden">
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 min-w-0">
        <BookmarkButton
          postId={post.id}
          variant="pill"
          stopPropagation={false}
          className="w-full justify-center border border-rule bg-paper-tint hover:bg-paper-2 text-[10px] sm:text-xs font-semibold text-ink-soft hover:text-ink px-2 sm:px-2.5 py-2.5 transition-colors"
        />
        <ShareButtons
          headline={post.headline}
          url={`${siteUrl}/news/${post.id}/`}
          placement="sheet"
          buttonClassName="w-full justify-center border border-rule bg-paper-tint hover:bg-paper-2 text-[10px] sm:text-xs font-semibold text-ink-soft hover:text-ink px-2 sm:px-2.5 py-2.5 transition-colors"
        />
        <SourcePickerButton
          sources={post.sources}
          label="Sources"
          placement="sheet"
          buttonClassName="w-full justify-center border border-rule bg-paper-tint hover:bg-paper-2 text-[10px] sm:text-xs font-semibold text-ink-soft hover:text-ink px-2 sm:px-2.5 py-2.5 transition-colors"
          stopPropagation={false}
        />
      </div>
    </footer>
  );
}
