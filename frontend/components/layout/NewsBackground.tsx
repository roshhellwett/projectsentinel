'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ParsedQuote {
  text: string;
  author: string;
}

function parseQuote(raw: string): ParsedQuote {
  let s = raw.replace(/^★\s*/, '').replace(/\s*★$/, '');
  const lastDash = s.lastIndexOf('—');
  if (lastDash > 0) {
    const author = s.substring(lastDash + 1).trim();
    let text = s.substring(0, lastDash).trim();
    text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    return {
      text,
      author: author.replace(/\b\w/g, (c) => c.toUpperCase()),
    };
  }
  return { text: s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(), author: '' };
}

const RAW_QUOTES = [
  "★ WHERE THE MIND IS WITHOUT FEAR AND THE HEAD IS HELD HIGH; WHERE KNOWLEDGE IS FREE — RABINDRANATH TAGORE ★",
  "★ IN A TIME OF DECEIT, TELLING THE TRUTH IS A REVOLUTIONARY ACT — GEORGE ORWELL ★",
  "★ SATYAMEVA JAYATE — TRUTH ALONE TRIUMPHS IN THE END — MUNDAKA UPANISHAD ★",
  "★ YOU HAVE TO DREAM BEFORE YOUR DREAMS CAN COME TRUE — DR. A.P.J. ABDUL KALAM ★",
  "★ CULTIVATION OF MIND SHOULD BE THE ULTIMATE AIM OF HUMAN EXISTENCE — DR. B.R. AMBEDKAR ★",
  "★ FREEDOM OF THE PRESS IS NOT JUST IMPORTANT TO DEMOCRACY, IT IS DEMOCRACY — WALTER CRONKITE ★",
  "★ AN ERROR DOES NOT BECOME TRUTH BY REASON OF MULTIPLIED PROPAGATION — MAHATMA GANDHI ★",
  "★ ARISE, AWAKE, AND STOP NOT TILL THE GOAL IS REACHED — SWAMI VIVEKANANDA ★",
  "★ THE TRUTH IS RARELY PURE AND NEVER SIMPLE — OSCAR WILDE ★",
  "★ THE ONLY WAY TO DEAL WITH AN UNFREE WORLD IS TO BECOME SO ABSOLUTELY FREE THAT YOUR EXISTENCE IS REBELLION — ALBERT CAMUS ★",
  "★ KNOWLEDGE WILL GIVE YOU POWER, BUT CHARACTER RESPECT — BRUCE LEE ★",
  "★ THREE THINGS CANNOT BE LONG HIDDEN: THE SUN, THE MOON, AND THE TRUTH — GAUTAMA BUDDHA ★",
  "★ EDUCATION IS THE MOST POWERFUL WEAPON WHICH YOU CAN USE TO CHANGE THE WORLD — NELSON MANDELA ★",
  "★ THE POWER OF QUESTIONING IS THE BASIS OF ALL HUMAN PROGRESS — INDIRA GANDHI ★",
  "★ INJUSTICE ANYWHERE IS A THREAT TO JUSTICE EVERYWHERE — MARTIN LUTHER KING JR. ★",
  "★ A ROOM WITHOUT BOOKS IS LIKE A BODY WITHOUT A SOUL — CICERO ★",
  "★ THE ONLY TRUE WISDOM IS IN KNOWING YOU KNOW NOTHING — SOCRATES ★",
  "★ THE SANCTITY OF TRUTH IS THE HIGHEST PRINCIPLE OF JOURNALISM — JOSEPH PULITZER ★",
  "★ BE THE CHANGE THAT YOU WISH TO SEE IN THE WORLD — MAHATMA GANDHI ★",
  "★ WE ARE WHAT WE REPEATEDLY DO. EXCELLENCE, THEN, IS NOT AN ACT, BUT A HABIT — ARISTOTLE ★",
  "★ THE PEN IS MIGHTIER THAN THE SWORD — EDWARD BULWER-LYTTON ★",
  "★ THE TRUTH WILL SET YOU FREE, BUT FIRST IT WILL MAKE YOU MISERABLE — JAMES A. GARFIELD ★",
  "★ THE HIGHEST RESULT OF EDUCATION IS TOLERANCE — HELEN KELLER ★",
  "★ EVERYTHING CAN BE TAKEN FROM A MAN BUT ONE THING: THE LAST OF THE HUMAN FREEDOMS — VIKTOR FRANKL ★",
  "★ DO NOT GO WHERE THE PATH MAY LEAD, GO INSTEAD WHERE THERE IS NO PATH AND LEAVE A TRAIL — RALPH WALDO EMERSON ★",
  "★ THE BEST WAY TO FIND YOURSELF IS TO LOSE YOURSELF IN THE SERVICE OF OTHERS — MAHATMA GANDHI ★",
  "★ LET US SACRIFICE OUR TODAY SO THAT OUR CHILDREN CAN HAVE A BETTER TOMORROW — DR. A.P.J. ABDUL KALAM ★",
  "★ INTEGRITY IS DOING THE RIGHT THING, EVEN WHEN NO ONE IS WATCHING — C.S. LEWIS ★",
  "★ THE SOUL IS HEALED BY BEING WITH CHILDREN AND SEEKING THE TRUTH — FYODOR DOSTOEVSKY ★",
];

const QUOTES: ParsedQuote[] = RAW_QUOTES.map(parseQuote);

const DISPLAY_MS = 18000;
const FADE_MS = 1000;

/**
 * NewsBackground — A layered typographic watermark.
 *
 * Layers, back to front:
 *   1. Editorial dot grid
 *   2. Large centered watermark (static, very faint)
 *   3. Rotating wisdom quote (crossfades every 20 s, no movement)
 *   4. Editorial stamps at top-left / bottom-right (tiny, static)
 *
 * Zero movement animation — nothing catches peripheral vision.
 * The "woah" comes from layered typography and restrained editorial design.
 */
export function NewsBackground() {
  const [index, setIndex] = useState(0);
  const [fadedIn, setFadedIn] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const cycle = () => {
      setFadedIn(false);
      timerRef.current = setTimeout(() => {
        setIndex((i) => (i + 1) % QUOTES.length);
        setFadedIn(true);
      }, FADE_MS);
    };
    const interval = setInterval(cycle, DISPLAY_MS);
    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const quote = QUOTES[index];

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none contain-layout"
      style={{ transform: 'translate3d(0,0,0)' }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-[0.48] dark:opacity-[0.32]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(var(--c-rule-strong) / 0.55) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="text-[clamp(4.5rem,10vw,8.5rem)] font-serif font-black uppercase tracking-tighter leading-none"
          style={{
            color: 'rgb(var(--c-accent) / 0.04)',
            WebkitTextStroke: '1px rgb(var(--c-accent) / 0.12)',
          }}
        >
          SATYAMEVA JAYATE
        </div>
        <div
          className="text-[clamp(3.2rem,7.5vw,6.5rem)] font-serif font-black uppercase tracking-tight mt-1 leading-none"
          style={{
            color: 'rgb(var(--c-ink) / 0.03)',
            WebkitTextStroke: '1px rgb(var(--c-ink) / 0.08)',
          }}
        >
          TRUTH ALONE TRIUMPHS
        </div>
      </div>

      <div
        className="absolute inset-0 flex items-start justify-center pointer-events-none"
        style={{ top: '22%' }}
      >
        <div
          className="text-center max-w-3xl px-6 transition-opacity duration-[1500ms] ease-out transform-gpu"
          style={{ opacity: fadedIn ? 1 : 0, transform: 'translate3d(0,0,0)', willChange: 'opacity' }}
        >
          <p className="font-serif italic text-[clamp(1.1rem,2.2vw,2rem)] leading-[1.5] text-ink font-normal"

            style={{ color: 'rgb(var(--c-ink) / 0.05)' }}
          >
            &ldquo;{quote.text}&rdquo;
          </p>
          {quote.author && (
            <p className="mt-3 text-[clamp(0.65rem,1.1vw,0.85rem)] font-sans font-semibold tracking-[0.18em] uppercase"
              style={{ color: 'rgb(var(--c-muted) / 0.05)' }}
            >
              {quote.author}
            </p>
          )}
        </div>
      </div>


      <div className="absolute bottom-6 right-6 sm:right-10 flex items-center gap-4 text-[9px] font-mono tracking-[0.25em] text-muted/30 uppercase">
        <span>ZENITH OPEN SOURCE &middot; INDEPENDENT JOURNALISM</span>
      </div>
    </div>
  );
}
