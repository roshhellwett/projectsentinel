import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { CategoryTag } from './CategoryTag';
import { formatDate } from '@/lib/utils/formatDate';
import { Z_INDEX } from '@/lib/theme/zIndex';

interface DrawerHeaderProps {
  category: string;
  publishedAt: string;
  onClose: () => void;
}

export function DrawerHeader({ category, publishedAt, onClose }: DrawerHeaderProps) {
  return (
    <header className={`relative ${Z_INDEX.content} flex items-center justify-between gap-3 rounded-t-xl bg-paper px-5 py-3.5 border-b border-rule flex-shrink-0 sm:px-6 lg:rounded-none lg:px-7`}>
      <div className="flex items-center gap-3 min-w-0">
        <CategoryTag category={category} />
        <span className="text-xs text-muted truncate">{formatDate(publishedAt)}</span>
      </div>
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onClose}
        className="p-2 hover:bg-paper-2 rounded transition-all hover-lift duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent flex-shrink-0"
        aria-label="Close article"
      >
        <X className="w-5 h-5 text-muted" />
      </motion.button>
    </header>
  );
}
