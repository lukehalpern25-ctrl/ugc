import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 100;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

function generateDedupeKey(
  eventType: string,
  identifier: string | null,
  eventData: Record<string, unknown>,
  page: string | null,
  creatorId: string | null
): string | null {
  if (!identifier) return null;

  switch (eventType) {
    case "page_viewed": {
      const eventPage = eventData?.path || page || "unknown";
      return `page_viewed:${identifier}:${eventPage}`;
    }
    case "contract_reviewed":
      return `contract_reviewed:${identifier}`;
    case "contract_signed":
      return `contract_signed:${creatorId || identifier}`;
    case "account_created":
      return `account_created:${creatorId || identifier}`;
    case "dashboard_viewed": {
      const phase = eventData?.phase || "unknown";
      return `dashboard_viewed:${creatorId || identifier}:${phase}`;
    }
    case "phase_completed": {
      const phase = eventData?.phase || "unknown";
      return `phase_completed:${creatorId || identifier}:${phase}`;
    }
    default:
      return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, event_data, visitor_id, creator_id, page } = body;

    if (!event_type) {
      return NextResponse.json({ error: "event_type required" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || null;
    const userAgent = request.headers.get("user-agent") || null;
    const referrer = request.headers.get("referer") || null;

    const rateLimitId = ip || visitor_id || "unknown";
    if (isRateLimited(rateLimitId)) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }

    console.log("[Analytics]", event_type, { event_data, visitor_id, creator_id, page });

    const identifier = ip || visitor_id;
    const dedupeKey = generateDedupeKey(event_type, identifier, event_data || {}, page, creator_id);

    const { error } = await supabase.from("analytics_events").upsert(
      {
        event_type,
        event_data: event_data || {},
        visitor_id: visitor_id || null,
        creator_id: creator_id || null,
        page: page || null,
        referrer,
        user_agent: userAgent,
        ip_address: ip,
        dedupe_key: dedupeKey,
      },
      {
        onConflict: "dedupe_key",
        ignoreDuplicates: true,
      }
    );

    if (error) {
      if (error.code === "23505") {
        console.log("[Analytics] Deduplicated:", event_type, dedupeKey);
        return NextResponse.json({ ok: true, deduplicated: true });
      }
      console.error("[Analytics] Error:", error);
      throw error;
    }

    console.log("[Analytics] Inserted:", event_type);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Analytics] Failed:", err);
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
  }
}
