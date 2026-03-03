import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || id.length < 36) {
    return NextResponse.json({ error: "Invalid creator ID" }, { status: 400 });
  }

  // Fetch all dashboard data in parallel
  const [profileRes, progressRes, warmupRes, postsRes, badgesRes, earningsRes, xpRes] =
    await Promise.all([
      supabase.from("creator_profiles").select("*").eq("id", id).single(),
      supabase.from("creator_progress").select("*").eq("creator_id", id),
      supabase.from("warmup_daily_tasks").select("*").eq("creator_id", id),
      supabase
        .from("creator_posts")
        .select("*")
        .eq("creator_id", id)
        .order("posted_at", { ascending: false })
        .limit(100),
      supabase.from("creator_badges").select("*").eq("creator_id", id),
      supabase
        .from("creator_earnings")
        .select("*")
        .eq("creator_id", id)
        .order("month", { ascending: false }),
      supabase
        .from("xp_events")
        .select("*")
        .eq("creator_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  if (profileRes.error || !profileRes.data) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: profileRes.data,
    progress: progressRes.data || [],
    warmupTasks: warmupRes.data || [],
    posts: postsRes.data || [],
    badges: badgesRes.data || [],
    earnings: earningsRes.data || [],
    recentXP: xpRes.data || [],
  });
}
