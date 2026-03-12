import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function checkAuth(request: NextRequest): boolean {
  const password = request.nextUrl.searchParams.get("key");
  const adminKey = process.env.ADMIN_KEY || "gymdex-admin";
  return password === adminKey;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if requesting a specific creator
  const creatorId = request.nextUrl.searchParams.get("creatorId");
  if (creatorId) {
    return getCreatorDetails(creatorId);
  }

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Run all queries in parallel
  const [
    totalCreatorsRes,
    phaseCountsRes,
    pitchViewsTotalRes,
    pitchViews7dRes,
    contractSignsTotalRes,
    contractSigns7dRes,
    dashboardViewsRes,
    phaseCompletionsRes,
    recentCreatorsRes,
    dailyViewsRes,
    dailySignupsRes,
    uniqueVisitorsTotalRes,
    uniqueVisitors7dRes,
  ] = await Promise.all([
    // Total creators
    supabase
      .from("creator_profiles")
      .select("*", { count: "exact", head: true }),

    // Creators per phase
    supabase
      .from("creator_profiles")
      .select("current_phase"),

    // Total pitch page views
    supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "page_view")
      .contains("event_data", { page: "/gymdex" }),

    // Pitch views last 7 days
    supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "page_view")
      .contains("event_data", { page: "/gymdex" })
      .gte("created_at", sevenDaysAgo),

    // Total contract signs
    supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "contract_signed"),

    // Contract signs last 7 days
    supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "contract_signed")
      .gte("created_at", sevenDaysAgo),

    // Dashboard views by phase
    supabase
      .from("analytics_events")
      .select("event_data")
      .eq("event_type", "dashboard_view"),

    // Phase completions
    supabase
      .from("analytics_events")
      .select("event_data")
      .eq("event_type", "phase_completed"),

    // All creators
    supabase
      .from("creator_profiles")
      .select("id, legal_name, email, current_phase, xp, level, current_streak, tiktok_url, instagram_url, created_at")
      .order("created_at", { ascending: false }),

    // Daily page views (last 30 days)
    supabase
      .from("analytics_events")
      .select("created_at")
      .eq("event_type", "page_view")
      .contains("event_data", { page: "/gymdex" })
      .gte("created_at", thirtyDaysAgo),

    // Daily signups (last 30 days)
    supabase
      .from("creator_profiles")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo),

    // Unique visitors total
    supabase
      .from("analytics_events")
      .select("visitor_id")
      .eq("event_type", "page_view")
      .contains("event_data", { page: "/gymdex" }),

    // Unique visitors 7d
    supabase
      .from("analytics_events")
      .select("visitor_id")
      .eq("event_type", "page_view")
      .contains("event_data", { page: "/gymdex" })
      .gte("created_at", sevenDaysAgo),
  ]);

  // Compute phase counts
  const phaseCounts: Record<string, number> = { setup: 0, warmup: 0, posting: 0, active: 0 };
  for (const row of phaseCountsRes.data || []) {
    phaseCounts[row.current_phase] = (phaseCounts[row.current_phase] || 0) + 1;
  }

  // Compute dashboard view counts by phase
  const dashboardPhaseViews: Record<string, number> = {};
  for (const row of dashboardViewsRes.data || []) {
    const phase = (row.event_data as Record<string, string>)?.phase || "unknown";
    dashboardPhaseViews[phase] = (dashboardPhaseViews[phase] || 0) + 1;
  }

  // Compute phase completions
  const phaseCompletions: Record<string, number> = {};
  for (const row of phaseCompletionsRes.data || []) {
    const phase = (row.event_data as Record<string, string>)?.phase || "unknown";
    phaseCompletions[phase] = (phaseCompletions[phase] || 0) + 1;
  }

  // Build daily chart data
  const dailyViews: Record<string, number> = {};
  const dailySignups: Record<string, number> = {};
  for (const row of dailyViewsRes.data || []) {
    const day = row.created_at.split("T")[0];
    dailyViews[day] = (dailyViews[day] || 0) + 1;
  }
  for (const row of dailySignupsRes.data || []) {
    const day = row.created_at.split("T")[0];
    dailySignups[day] = (dailySignups[day] || 0) + 1;
  }

  // Build 30-day chart
  const chart: { date: string; views: number; signups: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split("T")[0];
    chart.push({
      date: dateStr,
      views: dailyViews[dateStr] || 0,
      signups: dailySignups[dateStr] || 0,
    });
  }

  // Unique visitors
  const uniqueTotal = new Set((uniqueVisitorsTotalRes.data || []).map((r: { visitor_id: string }) => r.visitor_id).filter(Boolean)).size;
  const unique7d = new Set((uniqueVisitors7dRes.data || []).map((r: { visitor_id: string }) => r.visitor_id).filter(Boolean)).size;

  // Conversion rate
  const pitchViewsTotal = pitchViewsTotalRes.count || 0;
  const contractSignsTotal = contractSignsTotalRes.count || 0;
  const conversionRate = pitchViewsTotal > 0
    ? ((contractSignsTotal / pitchViewsTotal) * 100).toFixed(1)
    : "0";

  return NextResponse.json({
    overview: {
      totalCreators: totalCreatorsRes.count || 0,
      pitchViewsTotal,
      pitchViews7d: pitchViews7dRes.count || 0,
      contractSignsTotal,
      contractSigns7d: contractSigns7dRes.count || 0,
      conversionRate: Number(conversionRate),
      uniqueVisitorsTotal: uniqueTotal,
      uniqueVisitors7d: unique7d,
    },
    funnel: {
      pitchViews: pitchViewsTotal,
      contractSigned: contractSignsTotal,
      ...phaseCounts,
    },
    phaseCounts,
    dashboardPhaseViews,
    phaseCompletions,
    creators: recentCreatorsRes.data || [],
    chart,
  });
}

async function getCreatorDetails(creatorId: string) {
  const [
    profileRes,
    progressRes,
    warmupTasksRes,
    postsRes,
    badgesRes,
    earningsRes,
    xpEventsRes,
    notificationsRes,
  ] = await Promise.all([
    supabase.from("creator_profiles").select("*").eq("id", creatorId).single(),
    supabase.from("creator_progress").select("*").eq("creator_id", creatorId).order("completed_at", { ascending: false }),
    supabase.from("warmup_daily_tasks").select("*").eq("creator_id", creatorId).order("day_number"),
    supabase.from("creator_posts").select("*").eq("creator_id", creatorId).order("posted_at", { ascending: false }),
    supabase.from("creator_badges").select("*").eq("creator_id", creatorId).order("earned_at", { ascending: false }),
    supabase.from("creator_earnings").select("*").eq("creator_id", creatorId).order("month", { ascending: false }),
    supabase.from("xp_events").select("*").eq("creator_id", creatorId).order("created_at", { ascending: false }).limit(50),
    supabase.from("notifications_sent").select("*").eq("creator_id", creatorId).order("sent_at", { ascending: false }).limit(20),
  ]);

  if (profileRes.error || !profileRes.data) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: profileRes.data,
    progress: progressRes.data || [],
    warmupTasks: warmupTasksRes.data || [],
    posts: postsRes.data || [],
    badges: badgesRes.data || [],
    earnings: earningsRes.data || [],
    xpEvents: xpEventsRes.data || [],
    notifications: notificationsRes.data || [],
  });
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const creatorId = request.nextUrl.searchParams.get("creatorId");
  if (!creatorId) {
    return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
  }

  // Delete creator (cascade will handle related records)
  const { error } = await supabase
    .from("creator_profiles")
    .delete()
    .eq("id", creatorId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
