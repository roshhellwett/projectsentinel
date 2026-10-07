"use client";

import { motion, useReducedMotion } from "framer-motion";

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
  const reduceMotion = useReducedMotion();

  return (
    <div className="w-full max-w-2xl p-4 sm:p-8">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: "easeOut" }}
          className="grid h-14 w-14 place-items-center rounded-full border border-rule bg-paper-2 text-accent"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5.5h16v10H8.5L4 19V5.5Z" />
            <path d="M8 9.5h8M8 12.5h5" />
          </svg>
        </motion.div>

        <div className="max-w-[34rem] space-y-2">
          <p className="editorial-kicker">The news desk / Your questions</p>
          <h2 className="font-display text-[2rem] font-normal leading-snug text-ink sm:text-[2.8rem] tracking-tight">
            Let&apos;s get the <em className="text-accent">whole picture.</em>
          </h2>
          <p className="text-[0.86rem] leading-7 text-ink-soft sm:text-[0.9rem]">
            Ask about any story we’ve published, how our credibility scores work, or what’s happening in Indian news today.
          </p>
        </div>

        <motion.div
          initial={false}
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
                hidden: { opacity: 1, y: reduceMotion ? 0 : 12 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              type="button"
              onClick={() => onPrompt(p)}
              className="relative overflow-hidden rounded border border-rule bg-paper px-3.5 py-3 min-h-[44px] text-[0.72rem] font-medium text-ink-soft transition-colors hover:border-accent/40 hover:text-accent"
            >
              {p}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
