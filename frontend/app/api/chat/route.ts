import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/api/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Vercel Hobby caps serverless functions at 10s.
export const maxDuration = 10;

const FALLBACK = "Some error occurred, wait for a while";
const NO_STORE = { "Cache-Control": "no-store" } as const;

const MAX_MESSAGE_CHARS = 800;
const MAX_HISTORY_TURNS = 8;
/** Leave headroom under maxDuration so we always answer instead of being killed. */
const UPSTREAM_TIMEOUT_MS = 8_500;

type Turn = { role: "user" | "assistant"; content: string };

function degraded(reply = FALLBACK) {
  // Always 200: the widget degrades gracefully instead of showing a stack trace.
  return NextResponse.json({ reply, degraded: true }, { headers: NO_STORE });
}

function sanitizeHistory(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return [];
  const out: Turn[] = [];
  for (const item of raw.slice(-MAX_HISTORY_TURNS)) {
    if (!item || typeof item !== "object") continue;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const text = content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (text) out.push({ role, content: text });
  }
  return out;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed, resetAt } = checkRateLimit(ip, {
    windowMs: 60_000,
    maxRequests: 10,
    prefix: "chat",
  });
  if (!allowed) {
    return NextResponse.json(
      {
        reply:
          "You're sending messages a bit fast — give me a few seconds and try again.",
        degraded: false,
      },
      {
        status: 200,
        headers: {
          ...NO_STORE,
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return degraded("I couldn't read that message. Try sending it again?");
  }

  const { message, history } = (body ?? {}) as {
    message?: unknown;
    history?: unknown;
  };
  const text =
    typeof message === "string"
      ? message.trim().slice(0, MAX_MESSAGE_CHARS)
      : "";
  if (!text) {
    return NextResponse.json(
      {
        reply:
          "Ask me anything about India Verified or the stories we've published.",
        degraded: false,
      },
      { headers: NO_STORE },
    );
  }

  const workerUrl = (process.env.WORKER_URL || "").replace(/\/+$/, "");
  if (!workerUrl) return degraded();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(`${workerUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.WORKER_API_TOKEN
          ? { Authorization: `Bearer ${process.env.WORKER_API_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        message: text,
        history: sanitizeHistory(history),
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!upstream.ok) return degraded();

    const data = (await upstream.json()) as {
      reply?: unknown;
      degraded?: unknown;
    };
    const reply =
      typeof data.reply === "string" && data.reply.trim()
        ? data.reply.trim()
        : FALLBACK;

    return NextResponse.json(
      { reply, degraded: reply === FALLBACK || data.degraded === true },
      { headers: NO_STORE },
    );
  } catch {
    return degraded();
  } finally {
    clearTimeout(timer);
  }
}
