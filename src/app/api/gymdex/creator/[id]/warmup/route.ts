import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { awardXP, checkPhaseAdvancement } from "@/lib/gymdex/gamification";
import { XP_REWARDS, WARMUP_UNLOCK_HOURS } from "@/lib/gymdex/constants";
import { warmupDays } from "@/lib/gymdex/phases";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("warmup_daily_tasks")
    .select("*")
    .eq("creator_id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: data || [] });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { day_number, task_id } = body;

  if (!day_number || !task_id) {
    return NextResponse.json(
      { error: "day_number and task_id are required" },
      { status: 400 }
    );
  }

  // Validate day_number
  if (day_number < 1 || day_number > 3) {
    return NextResponse.json(
      { error: "day_number must be 1, 2, or 3" },
      { status: 400 }
    );
  }

  // Check time gate
  const { data: profile } = await supabase
    .from("creator_profiles")
    .select("warmup_started_at, current_phase")
    .eq("id", id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  if (profile.current_phase !== "warmup") {
    return NextResponse.json(
      { error: "Not in warm-up phase" },
      { status: 400 }
    );
  }

  if (!profile.warmup_started_at) {
    return NextResponse.json(
      { error: "Warm-up not started" },
      { status: 400 }
    );
  }

  // Time gate enforcement: Day N unlocks (N-1) * 24h after warmup_started_at
  const warmupStart = new Date(profile.warmup_started_at).getTime();
  const unlockTime = warmupStart + (day_number - 1) * WARMUP_UNLOCK_HOURS * 60 * 60 * 1000;

  if (Date.now() < unlockTime) {
    return NextResponse.json(
      {
        error: "Day not unlocked yet",
        unlocks_at: new Date(unlockTime).toISOString(),
      },
      { status: 403 }
    );
  }

  // Insert task completion
  const { error } = await supabase
    .from("warmup_daily_tasks")
    .insert({ creator_id: id, day_number, task_id });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ already_completed: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Award XP for task
  const xpResult = await awardXP(
    id,
    XP_REWARDS.WARMUP_TASK,
    `Warmup day ${day_number}: ${task_id}`,
    "warmup",
    task_id
  );

  // Check if day is fully complete
  const dayDef = warmupDays.find((d) => d.day === day_number);
  if (dayDef) {
    const { data: dayTasks } = await supabase
      .from("warmup_daily_tasks")
      .select("task_id")
      .eq("creator_id", id)
      .eq("day_number", day_number);

    const completedTaskIds = new Set((dayTasks || []).map((t: { task_id: string }) => t.task_id));
    // Check required tasks (d3-post is optional)
    const requiredTasks = dayDef.tasks.filter((t) => t.id !== "d3-post");
    const dayComplete = requiredTasks.every((t) => completedTaskIds.has(t.id));

    if (dayComplete) {
      // Award day completion bonus
      await awardXP(id, XP_REWARDS.WARMUP_DAY_BONUS, `Warmup day ${day_number} complete`, "warmup_day", String(day_number));

      // Mark day as completed on profile
      const dayField = `warmup_day${day_number}_completed_at`;
      await supabase
        .from("creator_profiles")
        .update({ [dayField]: new Date().toISOString() })
        .eq("id", id);

      // Check phase advancement (only after day 3)
      if (day_number === 3) {
        const advancement = await checkPhaseAdvancement(id, "warmup");
        return NextResponse.json({
          success: true,
          xp: xpResult,
          day_complete: true,
          advancement,
        });
      }
    }
  }

  return NextResponse.json({
    success: true,
    xp: xpResult,
  });
}
