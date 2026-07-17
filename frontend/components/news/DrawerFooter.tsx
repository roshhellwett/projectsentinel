import { Post } from "@/types";
import { BookmarkButton } from "./BookmarkButton";
import { ShareButtons } from "./ShareButtons";
import { SourcePickerButton } from "./SourcePickerButton";

interface DrawerFooterProps {
  post: Post;
  siteUrl: string;
}

export function DrawerFooter({ post, siteUrl }: DrawerFooterProps) {
  const commonBtnClass =
    "w-full justify-center text-[11px] sm:text-xs font-bold py-2.5 px-2";

  return (
    <footer className="flex-shrink-0 border-t border-rule bg-paper-2 px-2.5 sm:px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] pt-2.5 sm:pt-3 overflow-hidden">
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 min-w-0">
        <BookmarkButton
          postId={post.id}
          variant="pill"
          stopPropagation={false}
          className={commonBtnClass}
        />
        <ShareButtons
          headline={post.headline}
          url={`${siteUrl}/news/${post.id}/`}
          placement="sheet"
          buttonClassName={commonBtnClass}
        />
        <SourcePickerButton
          sources={post.sources}
          label="Sources"
          placement="sheet"
          buttonClassName={commonBtnClass}
          stopPropagation={false}
        />
      </div>
    </footer>
  );
}
