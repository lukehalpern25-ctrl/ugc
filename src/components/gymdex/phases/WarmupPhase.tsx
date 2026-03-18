"use client";

import { warmupDays } from "@/lib/gymdex/phases";
import { WARMUP_UNLOCK_HOURS } from "@/lib/gymdex/constants";
import type { CreatorProfile, WarmupDailyTask } from "@/lib/gymdex/types";
import WarmupDayCard from "./WarmupDayCard";
import TimeGate from "../TimeGate";

const DAY_PAYMENTS = [5, 7, 10] as const;

interface WarmupPhaseProps {
  creatorId: string;
  profile: CreatorProfile;
  warmupTasks: WarmupDailyTask[];
  onComplete: () => void;
  onRefetch: () => void;
}

export default function WarmupPhase({
  creatorId,
  profile,
  warmupTasks,
  onComplete,
  onRefetch,
}: WarmupPhaseProps) {
  const warmupStart = profile.warmup_started_at
    ? new Date(profile.warmup_started_at)
    : new Date();

  // Build completed tasks per day
  const tasksByDay: Record<number, Set<string>> = { 1: new Set(), 2: new Set(), 3: new Set() };
  for (const task of warmupTasks) {
    if (tasksByDay[task.day_number]) {
      tasksByDay[task.day_number].add(task.task_id);
    }
  }

  const dayCompletions = [
    !!profile.warmup_day1_completed_at,
    !!profile.warmup_day2_completed_at,
    !!profile.warmup_day3_completed_at,
  ];

  // Find the next locked day
  const getUnlockTime = (day: number) => {
    return new Date(warmupStart.getTime() + (day - 1) * WARMUP_UNLOCK_HOURS * 60 * 60 * 1000);
  };

  const isDayUnlocked = (day: number) => {
    return Date.now() >= getUnlockTime(day).getTime();
  };

  // Find next locked day for countdown
  const nextLockedDay = warmupDays.find(
    (d) => !isDayUnlocked(d.day) && !dayCompletions[d.day - 1]
  );

  const handleTaskComplete = () => {
    onRefetch();
    // Check if phase advanced after refetch
    setTimeout(() => {
      // The refetch will update the profile, and if phase advanced,
      // the parent dashboard will re-render
    }, 500);
  };

  const earnedSoFar = dayCompletions.reduce(
    (sum, completed, i) => sum + (completed ? DAY_PAYMENTS[i] : 0),
    0
  );
  const totalPossible = DAY_PAYMENTS.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground">Warm-up Period</h2>
        <p className="text-sm text-muted">
          3 days to warm up your accounts before posting. Each day unlocks 24
          hours after the previous one.
        </p>
      </div>

      {/* Earnings banner */}
      <div className="rounded-xl border border-success/30 bg-success/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-success font-medium uppercase tracking-wide">Onboarding Bonus</p>
            <p className="text-2xl font-bold text-success">${earnedSoFar} <span className="text-sm font-normal text-muted">/ ${totalPossible}</span></p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Cash out after</p>
            <p className="text-sm font-medium text-foreground">3rd post in app</p>
          </div>
        </div>
      </div>

      {/* Time gate countdown */}
      {nextLockedDay && (
        <TimeGate
          unlockTime={getUnlockTime(nextLockedDay.day)}
          label={`Day ${nextLockedDay.day} unlocks in`}
        />
      )}

      {/* Day cards */}
      {warmupDays.map((dayDef, index) => (
        <WarmupDayCard
          key={dayDef.day}
          dayDef={dayDef}
          completedTasks={tasksByDay[dayDef.day]}
          isUnlocked={isDayUnlocked(dayDef.day)}
          isCompleted={dayCompletions[dayDef.day - 1]}
          creatorId={creatorId}
          onTaskComplete={handleTaskComplete}
          payment={DAY_PAYMENTS[index]}
        />
      ))}
    </div>
  );
}
