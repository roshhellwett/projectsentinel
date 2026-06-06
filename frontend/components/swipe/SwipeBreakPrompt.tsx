'use client';

interface SwipeBreakPromptProps {
  cardsThisSession: number;
  onSnooze: () => void;
  onContinue: () => void;
}

export function SwipeBreakPrompt({ cardsThisSession, onSnooze, onContinue }: SwipeBreakPromptProps) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="swipe-break-title"
    >
      <button
        type="button"
        onClick={onContinue}
        className="absolute inset-0 bg-ink/55 backdrop-blur-[2px] cursor-pointer"
        aria-label="Dismiss break prompt"
      />
      <div className="relative w-full max-w-sm bg-paper border border-rule-strong rounded-md shadow-paper-lift overflow-hidden">
        <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent mb-2">
            Pause for a moment
          </p>
          <h2 id="swipe-break-title" className="font-display text-xl font-bold text-ink leading-tight mb-3">
            You&apos;ve read {cardsThisSession} stories in a row.
          </h2>
          <p className="text-[13.5px] text-muted leading-relaxed mb-6">
            The headlines will still be here in ten minutes. Take a breath, stretch, look out a window — your brain will thank you.
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onSnooze}
              className="w-full px-4 py-2.5 bg-ink text-paper text-[13px] font-semibold rounded hover:bg-ink/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Take a break
            </button>
            <button
              type="button"
              onClick={onContinue}
              className="w-full px-4 py-2 text-[12px] font-medium text-muted hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              Keep reading
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
