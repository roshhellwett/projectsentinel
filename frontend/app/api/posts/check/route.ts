import { NextResponse } from "next/server";
import { fetchPostsCursor } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/api/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip, {
    windowMs: 10_000,
    maxRequests: 60,
    prefix: "check",
  });
  if (!allowed) {
    return NextResponse.json({ hasNew: false, count: 0 }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since");
  if (!since) return NextResponse.json({ hasNew: false, count: 0 });

  // Grab 1 post — if its id differs from `since`, there's something new
  const { posts } = await fetchPostsCursor(undefined, 1);
  const hasNew = posts.length > 0 && posts[0].id !== since;

  return NextResponse.json({ hasNew, count: hasNew ? 1 : 0 });
}
