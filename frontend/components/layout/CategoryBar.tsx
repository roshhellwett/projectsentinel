'use client';

import { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const categories = [
  'All',
  'Politics',
  'Business',
  'Sports',
  'Tech',
  'Entertainment',
  'Education',
  'Health',
  'World'
];

function CategoryButton({ category, isSelected, href }: { category: string; isSelected: boolean; href: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || isSelected) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.25);
    y.set((e.clientY - centerY) * 0.25);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link href={href} scroll={false}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          x: springX,
          y: springY,
        }}
        className="relative px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300"
        whileHover={{ scale: isSelected ? 1 : 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isSelected && (
          <motion.div
            layoutId="category-bg"
            className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-full shadow-sm"
            transition={{
              type: "spring",
              bounce: 0.15,
              duration: 0.6
            }}
          />
        )}

        {!isSelected && (
          <span className="absolute inset-0 bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-full" />
        )}

        <span className={`relative z-10 tracking-wide ${isSelected ? 'text-white' : 'text-slate-700'}`}>
          {category}
        </span>
      </motion.div>
    </Link>
  );
}

export function CategoryBar() {
  const pathname = usePathname();
  const currentCategory: string = pathname?.startsWith('/category/')
    ? pathname.split('/')[2]
    : 'all';
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentCategory]);

  return (
    <div className="relative">
      <div ref={scrollRef} className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <div ref={activeRef} className="flex items-center gap-2 px-0.5">
          {categories.map((category) => {
            const slug = category === 'All' ? 'all' : category.toLowerCase();
            const isActive = currentCategory === slug;
            const href = category === 'All' ? '/' : `/category/${slug}`;
            return (
              <CategoryButton
                key={category}
                category={category}
                isSelected={isActive}
                href={href}
              />
            );
          })}
        </div>
      </div>

      {/* Fade edges for scroll indication */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#fafafa] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#fafafa] to-transparent pointer-events-none" />
    </div>
  );
}
