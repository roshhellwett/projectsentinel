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
    <div className="w-full max-w-2xl rounded-[1.75rem] border border-rule/70 bg-paper-2/80 p-6 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.28)] sm:p-8">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
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

        <div className="max-w-[34rem] space-y-2">
          <h2 className="text-[1.05rem] font-semibold leading-snug text-ink sm:text-[1.15rem]">
            India Verified Desk Assistant
          </h2>
          <p className="text-[0.86rem] leading-7 text-ink-soft sm:text-[0.9rem]">
            Ask about any story we’ve published, how our credibility scores work, or what’s happening in Indian news today.
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
              className="relative overflow-hidden rounded-full border border-rule/80 bg-paper px-3.5 py-2 text-[0.72rem] font-medium text-ink-soft shadow-xs transition-colors hover:border-accent/40 hover:text-accent"
            >
              {p}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}