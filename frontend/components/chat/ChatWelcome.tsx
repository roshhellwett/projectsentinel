"use client";

import { motion } from "framer-motion";

const PROMPTS = [
  "What's new today?",
  "How is the credibility score decided?",
  "Latest in tech",
  "Top political news",
] as const;

const CONTEXTUAL_PROMPTS = [
  "Is this news true?",
  "Summarize this story",
  "Show related stories",
  "What do sources say?",
] as const;

export function ChatWelcome({
  onPrompt,
  hasArticleContext,
}: {
  onPrompt: (text: string) => void;
  hasArticleContext: boolean;
}) {
  const prompts = hasArticleContext ? CONTEXTUAL_PROMPTS : PROMPTS;

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid h-14 w-14 place-items-center rounded-full bg-ink text-paper shadow-md"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 5.5h16v10H8.5L4 19V5.5Z" />
          <path d="M8 9.5h8M8 12.5h5" />
        </svg>
      </motion.div>

      <div className="max-w-[28ch] space-y-1.5">
        <h2 className="text-[1.05rem] font-bold leading-snug text-ink">
          India Verified Desk Assistant
        </h2>
        <p className="text-[0.85rem] leading-relaxed text-ink-soft">
          Ask me about any story we&apos;ve published, how our credibility scores work, or what&apos;s happening in Indian news today.
        </p>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.06 } },
        }}
        className="flex flex-wrap justify-center gap-2 pt-2"
      >
        {prompts.map((p) => (
          <motion.button
            key={p}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => onPrompt(p)}
            className="relative overflow-hidden rounded-lg border border-rule bg-paper-2 px-3 py-1.5 text-[0.72rem] font-medium text-ink-soft shadow-xs transition-colors hover:border-accent/40 hover:text-accent"
          >
            {p}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}