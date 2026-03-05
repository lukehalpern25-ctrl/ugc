import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, event_data, visitor_id, creator_id, page } = body;

    if (!event_type) {
      return NextResponse.json({ error: "event_type required" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const userAgent = request.headers.get("user-agent") || null;
    const referrer = request.headers.get("referer") || null;

    // Generate dedupe key for page_view events (one view per IP/visitor per page)
    let dedupeKey: string | null = null;
    if (event_type === "page_view") {
      const eventPage = event_data?.page || page || "unknown";
      const identifier = ip || visitor_id;
      if (identifier) {
        dedupeKey = `page_view:${identifier}:${eventPage}`;
      }
    }

    // Use upsert with ON CONFLICT DO NOTHING for atomic deduplication
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
      // Unique constraint violation means duplicate - that's expected
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, deduplicated: true });
      }
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
  }
}
