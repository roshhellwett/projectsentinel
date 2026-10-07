"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EditorialIllustration } from "@/components/visual/EditorialIllustration";

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
        <EditorialIllustration variant="assistant" className="assistant-scene" />

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
              className="assistant-prompt relative overflow-hidden px-3.5 py-3 min-h-[44px] text-[0.72rem] font-medium text-ink-soft transition-colors hover:text-accent"
            >
              {p}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
