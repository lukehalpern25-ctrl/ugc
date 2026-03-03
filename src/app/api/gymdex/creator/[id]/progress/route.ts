import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { awardXP, checkPhaseAdvancement } from "@/lib/gymdex/gamification";
import { XP_REWARDS } from "@/lib/gymdex/constants";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("creator_progress")
    .select("*")
    .eq("creator_id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ progress: data || [] });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { phase, step_id } = body;

  if (!phase || !step_id) {
    return NextResponse.json(
      { error: "phase and step_id are required" },
      { status: 400 }
    );
  }

  // Insert progress (unique constraint prevents duplicates)
  const { error } = await supabase
    .from("creator_progress")
    .insert({ creator_id: id, phase, step_id });

  if (error) {
    if (error.code === "23505") {
      // Already completed
      return NextResponse.json({ already_completed: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Award XP based on phase
  const xpAmount =
    phase === "setup"
      ? XP_REWARDS.SETUP_STEP
      : phase === "posting"
      ? XP_REWARDS.POSTING_STEP
      : 0;

  let xpResult = null;
  if (xpAmount > 0) {
    xpResult = await awardXP(id, xpAmount, `${phase} step: ${step_id}`, "progress", step_id);
  }

  // Check if phase should advance
  const { data: profile } = await supabase
    .from("creator_profiles")
    .select("current_phase")
    .eq("id", id)
    .single();

  let advancement = null;
  if (profile && profile.current_phase === phase) {
    advancement = await checkPhaseAdvancement(id, phase);
  }

  return NextResponse.json({
    success: true,
    xp: xpResult,
    advancement,
  });
}
