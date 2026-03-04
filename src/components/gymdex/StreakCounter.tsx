"use client";

import { Flame } from "lucide-react";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={currentStreak > 0 ? "flame-pulse" : ""}>
            <Flame size={28} className={currentStreak > 0 ? "text-orange-500" : "text-muted"} />
          </span>
          <div>
            <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
            <p className="text-xs text-muted">Day Streak</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-muted">{longestStreak}</p>
          <p className="text-[10px] text-muted">Best</p>
        </div>
      </div>

      {currentStreak === 0 && (
        <p className="text-xs text-muted mt-3">
          Post today to start a streak!
        </p>
      )}
      {currentStreak > 0 && currentStreak < 3 && (
        <p className="text-xs text-muted mt-3">
          {3 - currentStreak} more day{3 - currentStreak > 1 ? "s" : ""} to unlock the On a Roll badge!
        </p>
      )}
      {currentStreak >= 3 && currentStreak < 7 && (
        <p className="text-xs text-primary-light mt-3">
          {7 - currentStreak} days to Week Warrior!
        </p>
      )}
      {currentStreak >= 7 && currentStreak < 14 && (
        <p className="text-xs text-primary-light mt-3">
          {14 - currentStreak} days to Unstoppable!
        </p>
      )}
      {currentStreak >= 14 && currentStreak < 30 && (
        <p className="text-xs text-primary-light mt-3">
          {30 - currentStreak} days to Iron Will!
        </p>
      )}
      {currentStreak >= 30 && (
        <p className="text-xs text-success mt-3 font-medium">
          Incredible streak! Keep it going!
        </p>
      )}
    </div>
  );
}
