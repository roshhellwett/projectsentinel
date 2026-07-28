"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type InlineToken =
  | { type: "text"; content: string }
  | { type: "bold"; content: string }
  | { type: "italic"; content: string }
  | { type: "code"; content: string }
  | { type: "article-link"; id: string };

function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const re = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`([^`]+)`)|(\/news\/([0-9a-fA-F-]{36}))/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) tokens.push({ type: "text", content: text.slice(last, m.index) });
    if (m[1]) tokens.push({ type: "bold", content: m[2] });
    else if (m[3]) tokens.push({ type: "italic", content: m[4] });
    else if (m[5]) tokens.push({ type: "code", content: m[6] });
    else if (m[7]) tokens.push({ type: "article-link", id: m[8] });
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push({ type: "text", content: text.slice(last) });
  return tokens;
}

function renderInline(tokens: InlineToken[]): ReactNode {
  return tokens.map((t, i) => {
    switch (t.type) {
      case "bold":
        return <strong key={i} className="font-semibold text-ink">{t.content}</strong>;
      case "italic":
        return <em key={i} className="italic">{t.content}</em>;
      case "code":
        return (
          <code key={i} className="rounded border border-rule bg-paper-2 px-1 py-0.5 font-mono text-[0.8em] text-ink">
            {t.content}
          </code>
        );
      case "article-link":
        return (
          <Link
            key={i}
            href={`/news/${t.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-ink px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-paper shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            READ STORY
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        );
      case "text":
      default:
        return <span key={i}>{t.content}</span>;
    }
  });
}

type LineType =
  | { kind: "empty" }
  | { kind: "heading"; text: string }
  | { kind: "blockquote"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "numbered"; text: string; number: number }
  | { kind: "paragraph"; text: string };

function classifyLine(raw: string): LineType {
  const t = raw.trim();
  if (!t) return { kind: "empty" };
  if (t.startsWith("### ")) return { kind: "heading", text: t.slice(4) };
  if (t.startsWith("## ")) return { kind: "heading", text: t.slice(3) };
  if (t.startsWith("> ")) return { kind: "blockquote", text: t.slice(2) };
  if (t.startsWith("* ") || t.startsWith("- ")) return { kind: "bullet", text: t.slice(2) };
  const nm = t.match(/^(\d+)\.\s/);
  if (nm) return { kind: "numbered", text: t.slice(nm[0].length), number: parseInt(nm[1]) };
  return { kind: "paragraph", text: t };
}

export function AssistantText({ text, revealCount }: { text: string; revealCount?: number }) {
  if (!text) return null;

  const visibleText = revealCount === undefined ? text : text.slice(0, Math.max(0, revealCount));
  const lines = visibleText.split("\n");

  return (
    <div className="flex flex-col gap-2.5">
      {lines.map((raw, i) => {
        const line = classifyLine(raw);
        switch (line.kind) {
          case "empty":
            return <div key={i} className="h-1.5" />;
          case "heading":
            return (
              <h3 key={i} className="text-[0.95rem] font-bold leading-snug text-ink">
                {renderInline(tokenizeInline(line.text))}
              </h3>
            );
          case "blockquote":
            return (
              <blockquote key={i} className="border-l-2 border-accent/25 pl-4 italic leading-[1.75] text-ink-soft">
                {renderInline(tokenizeInline(line.text))}
              </blockquote>
            );
          case "bullet":
            return (
              <div key={i} className="relative pl-5 before:absolute before:left-1 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent/50">
                <p className="text-[0.875rem] leading-[1.75] text-ink-soft">
                  {renderInline(tokenizeInline(line.text))}
                </p>
              </div>
            );
          case "numbered":
            return (
              <div key={i} className="flex gap-2.5 pl-0.5">
                <span className="mt-[0.1em] shrink-0 text-[0.75rem] font-bold leading-[1.75] text-accent">
                  {line.number}.
                </span>
                <p className="text-[0.875rem] leading-[1.75] text-ink-soft">
                  {renderInline(tokenizeInline(line.text))}
                </p>
              </div>
            );
          case "paragraph":
          default:
            return (
              <p key={i} className="text-[0.875rem] leading-[1.75] text-ink-soft">
                {renderInline(tokenizeInline(line.text))}
              </p>
            );
        }
      })}
    </div>
  );
}