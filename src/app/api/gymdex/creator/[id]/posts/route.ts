import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  awardXP,
  updateStreak,
  checkPostMilestones,
  checkDailyQuota,
} from "@/lib/gymdex/gamification";
import { XP_REWARDS } from "@/lib/gymdex/constants";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("creator_posts")
    .select("*")
    .eq("creator_id", id)
    .order("posted_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data || [] });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { platform, post_url, posted_at } = body;

  if (!platform || !["tiktok", "instagram"].includes(platform)) {
    return NextResponse.json(
      { error: "platform must be 'tiktok' or 'instagram'" },
      { status: 400 }
    );
  }

  const postDate = posted_at || new Date().toISOString().split("T")[0];

  const { data: post, error } = await supabase
    .from("creator_posts")
    .insert({
      creator_id: id,
      platform,
      post_url: post_url || null,
      posted_at: postDate,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Award XP for logging post
  const xpResult = await awardXP(
    id,
    XP_REWARDS.POST_LOGGED,
    `Post logged: ${platform}`,
    "post",
    post.id
  );

  // Update streak
  const streakResult = await updateStreak(id, postDate);

  // Check post milestones
  const postBadges = await checkPostMilestones(id);

  // Check daily quota
  const quotaMet = await checkDailyQuota(id, postDate);

  return NextResponse.json({
    success: true,
    post,
    xp: xpResult,
    streak: streakResult,
    newBadges: [...streakResult.newBadges, ...postBadges],
    quotaMet,
  });
}
