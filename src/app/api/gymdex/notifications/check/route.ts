import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendNotification } from "@/lib/gymdex/notifications";

// Cron endpoint: runs every 4 hours via Vercel Cron
// Detects stalled creators and sends nudge emails

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results: string[] = [];

  // ─── Stall: Setup (no progress for 24h) ───────────────────────────
  {
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const { data: stalled } = await supabase
      .from("creator_profiles")
      .select("id, email, legal_name, updated_at")
      .eq("current_phase", "setup")
      .not("email", "is", null)
      .lt("updated_at", cutoff);

    for (const creator of stalled || []) {
      if (creator.email) {
        const sent = await sendNotification(creator.id, "stall_setup", creator.email, {
          name: creator.legal_name,
        });
        if (sent) results.push(`stall_setup → ${creator.email}`);
      }
    }
  }

  // ─── Stall: Warmup (day not started 36h after unlock) ─────────────
  {
    const cutoff36h = new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString();
    const { data: warmupStalled } = await supabase
      .from("creator_profiles")
      .select("id, email, legal_name, warmup_started_at, warmup_day1_completed_at, warmup_day2_completed_at, warmup_day3_completed_at")
      .eq("current_phase", "warmup")
      .not("email", "is", null)
      .lt("warmup_started_at", cutoff36h);

    for (const creator of warmupStalled || []) {
      // Only send if they have incomplete days
      const hasUnfinishedDay =
        !creator.warmup_day1_completed_at ||
        !creator.warmup_day2_completed_at ||
        !creator.warmup_day3_completed_at;

      if (hasUnfinishedDay && creator.email) {
        const sent = await sendNotification(creator.id, "stall_warmup", creator.email, {
          name: creator.legal_name,
        });
        if (sent) results.push(`stall_warmup → ${creator.email}`);
      }
    }
  }

  // ─── Stall: Posting (no progress for 48h) ─────────────────────────
  {
    const cutoff48h = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
    const { data: postingStalled } = await supabase
      .from("creator_profiles")
      .select("id, email, legal_name, updated_at")
      .eq("current_phase", "posting")
      .not("email", "is", null)
      .lt("updated_at", cutoff48h);

    for (const creator of postingStalled || []) {
      if (creator.email) {
        const sent = await sendNotification(creator.id, "stall_posting", creator.email, {
          name: creator.legal_name,
        });
        if (sent) results.push(`stall_posting → ${creator.email}`);
      }
    }
  }

  // ─── Missed Posts: 2 days without posting ──────────────────────────
  {
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const { data: activeCreators } = await supabase
      .from("creator_profiles")
      .select("id, email, legal_name, current_streak, last_post_date")
      .eq("current_phase", "active")
      .not("email", "is", null)
      .not("last_post_date", "is", null)
      .lt("last_post_date", twoDaysAgo);

    for (const creator of activeCreators || []) {
      if (creator.email) {
        const sent = await sendNotification(creator.id, "missed_posts_2day", creator.email, {
          name: creator.legal_name,
          streak: String(creator.current_streak),
        });
        if (sent) results.push(`missed_posts_2day → ${creator.email}`);
      }
    }
  }

  return NextResponse.json({
    checked_at: now.toISOString(),
    notifications_sent: results.length,
    details: results,
  });
}
