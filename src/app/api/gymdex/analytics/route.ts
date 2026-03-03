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

    await supabase.from("analytics_events").insert({
      event_type,
      event_data: event_data || {},
      visitor_id: visitor_id || null,
      creator_id: creator_id || null,
      page: page || null,
      referrer,
      user_agent: userAgent,
      ip_address: ip,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
  }
}
