import { supabase } from "@/lib/supabase";
import {
  XP_REWARDS,
  getLevelForXP,
  STREAK_MILESTONES,
  POST_MILESTONES,
  DAILY_POST_QUOTA,
} from "./constants";
import type { CreatorProfile } from "./types";

// ─── Award XP ────────────────────────────────────────────────────────

export async function awardXP(
  creatorId: string,
  amount: number,
  reason: string,
  sourceType?: string,
  sourceId?: string
): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
  // Insert XP event
  await supabase.from("xp_events").insert({
    creator_id: creatorId,
    amount,
    reason,
    source_type: sourceType || null,
    source_id: sourceId || null,
  });

  // Get current profile
  const { data: profile } = await supabase
    .from("creator_profiles")
    .select("xp, level")
    .eq("id", creatorId)
    .single();

  if (!profile) throw new Error("Creator not found");

  const newXP = profile.xp + amount;
  const newLevelDef = getLevelForXP(newXP);
  const leveledUp = newLevelDef.level > profile.level;

  // Update profile
  await supabase
    .from("creator_profiles")
    .update({ xp: newXP, level: newLevelDef.level })
    .eq("id", creatorId);

  // Award level-based badges
  if (newLevelDef.level >= 5) {
    await awardBadge(creatorId, "creator_status");
  }
  if (newLevelDef.level >= 10) {
    await awardBadge(creatorId, "legendary");
  }

  return { newXP, newLevel: newLevelDef.level, leveledUp };
}

// ─── Award Badge ─────────────────────────────────────────────────────

export async function awardBadge(
  creatorId: string,
  badgeId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("creator_badges")
    .insert({ creator_id: creatorId, badge_id: badgeId });

  // Returns true if newly awarded, false if already had it (unique constraint)
  return !error;
}

// ─── Update Streak ───────────────────────────────────────────────────

export async function updateStreak(
  creatorId: string,
  postDate: string
): Promise<{ streak: number; newBadges: string[] }> {
  const { data: profile } = await supabase
    .from("creator_profiles")
    .select("current_streak, longest_streak, last_post_date")
    .eq("id", creatorId)
    .single();

  if (!profile) throw new Error("Creator not found");

  const today = new Date(postDate);
  const lastPost = profile.last_post_date ? new Date(profile.last_post_date) : null;

  let newStreak = 1;
  if (lastPost) {
    const diffDays = Math.floor(
      (today.getTime() - lastPost.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) {
      // Same day, streak doesn't change
      return { streak: profile.current_streak, newBadges: [] };
    } else if (diffDays === 1) {
      // Consecutive day
      newStreak = profile.current_streak + 1;
    }
    // else diffDays > 1, streak resets to 1
  }

  const newLongest = Math.max(newStreak, profile.longest_streak);

  await supabase
    .from("creator_profiles")
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_post_date: postDate,
    })
    .eq("id", creatorId);

  // Check streak milestones
  const newBadges: string[] = [];
  for (const milestone of STREAK_MILESTONES) {
    if (newStreak >= milestone.days && profile.current_streak < milestone.days) {
      const awarded = await awardBadge(creatorId, milestone.badge);
      if (awarded) newBadges.push(milestone.badge);
      await awardXP(creatorId, milestone.xp, `${milestone.days}-day streak`, "streak", milestone.badge);
    }
  }

  return { streak: newStreak, newBadges };
}

// ─── Check Post Milestones ───────────────────────────────────────────

export async function checkPostMilestones(
  creatorId: string
): Promise<string[]> {
  const { count } = await supabase
    .from("creator_posts")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", creatorId);

  const totalPosts = count || 0;
  const newBadges: string[] = [];

  for (const milestone of POST_MILESTONES) {
    if (totalPosts >= milestone.count) {
      const awarded = await awardBadge(creatorId, milestone.badge);
      if (awarded) newBadges.push(milestone.badge);
    }
  }

  return newBadges;
}

// ─── Check Daily Quota ───────────────────────────────────────────────

export async function checkDailyQuota(
  creatorId: string,
  date: string
): Promise<boolean> {
  const { count } = await supabase
    .from("creator_posts")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", creatorId)
    .eq("posted_at", date);

  const postsToday = count || 0;

  if (postsToday >= DAILY_POST_QUOTA) {
    const awarded = await awardBadge(creatorId, "full_day");
    if (awarded) {
      await awardXP(creatorId, XP_REWARDS.DAILY_QUOTA_BONUS, "Daily quota met", "quota", date);
    }
    return true;
  }
  return false;
}

// ─── Phase Advancement ───────────────────────────────────────────────

export async function checkPhaseAdvancement(
  creatorId: string,
  currentPhase: string
): Promise<{ advanced: boolean; newPhase: string | null }> {
  const phaseOrder = ["setup", "warmup", "posting", "active"];
  const currentIndex = phaseOrder.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex >= phaseOrder.length - 1) {
    return { advanced: false, newPhase: null };
  }

  let allComplete = false;

  if (currentPhase === "setup") {
    allComplete = await isSetupComplete(creatorId);
  } else if (currentPhase === "warmup") {
    allComplete = await isWarmupComplete(creatorId);
  } else if (currentPhase === "posting") {
    allComplete = await isPostingComplete(creatorId);
  }

  if (allComplete) {
    const newPhase = phaseOrder[currentIndex + 1];

    // Award phase completion XP and badge
    const phaseXP: Record<string, number> = {
      setup: XP_REWARDS.PHASE_SETUP,
      warmup: XP_REWARDS.PHASE_WARMUP,
      posting: XP_REWARDS.PHASE_POSTING,
    };
    const phaseBadge: Record<string, string> = {
      setup: "all_set_up",
      warmup: "warmed_up",
      posting: "fully_trained",
    };

    if (phaseXP[currentPhase]) {
      await awardXP(creatorId, phaseXP[currentPhase], `${currentPhase} phase complete`, "phase", currentPhase);
    }
    if (phaseBadge[currentPhase]) {
      await awardBadge(creatorId, phaseBadge[currentPhase]);
    }

    await supabase
      .from("creator_profiles")
      .update({
        current_phase: newPhase,
        ...(newPhase === "warmup" ? { warmup_started_at: new Date().toISOString() } : {}),
      })
      .eq("id", creatorId);

    return { advanced: true, newPhase };
  }

  return { advanced: false, newPhase: null };
}

async function isSetupComplete(creatorId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from("creator_profiles")
    .select("email, phone, payment_method, payment_handle, tiktok_url, instagram_url")
    .eq("id", creatorId)
    .single();

  if (!profile) return false;

  const { data: progress } = await supabase
    .from("creator_progress")
    .select("step_id")
    .eq("creator_id", creatorId)
    .eq("phase", "setup");

  const completedSteps = new Set((progress || []).map((p: { step_id: string }) => p.step_id));

  return !!(
    profile.email &&
    profile.phone &&
    profile.payment_method &&
    profile.payment_handle &&
    profile.tiktok_url &&
    profile.instagram_url &&
    completedSteps.has("setup-bio-check")
  );
}

async function isWarmupComplete(creatorId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from("creator_profiles")
    .select("warmup_day3_completed_at")
    .eq("id", creatorId)
    .single();

  return !!profile?.warmup_day3_completed_at;
}

async function isPostingComplete(creatorId: string): Promise<boolean> {
  const { data: progress } = await supabase
    .from("creator_progress")
    .select("step_id")
    .eq("creator_id", creatorId)
    .eq("phase", "posting");

  // Import the guide steps to check total count
  const { getAllItems } = await import("@/lib/steps");
  const allItems = getAllItems();
  const completedSteps = new Set((progress || []).map((p: { step_id: string }) => p.step_id));

  return allItems.every((item) => completedSteps.has(item.id));
}
