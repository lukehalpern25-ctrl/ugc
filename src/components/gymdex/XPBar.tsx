"use client";

import { getXPProgress, getLevelForXP, LEVELS } from "@/lib/gymdex/constants";

interface XPBarProps {
  xp: number;
}

export default function XPBar({ xp }: XPBarProps) {
  const level = getLevelForXP(xp);
  const { current, next, progress } = getXPProgress(xp);
  const isMaxLevel = level.level === LEVELS[LEVELS.length - 1].level;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-xs font-bold text-primary-light">{level.level}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{level.name}</p>
            <p className="text-[10px] text-muted">{xp.toLocaleString()} XP total</p>
          </div>
        </div>
        {!isMaxLevel && (
          <p className="text-xs text-muted">
            {current}/{next} XP
          </p>
        )}
      </div>

      <div className="w-full h-3 bg-surface-light rounded-full overflow-hidden">
        <div
          className="h-full rounded-full progress-bar-shine transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!isMaxLevel && (
        <p className="text-[10px] text-muted mt-1.5 text-right">
          Level {level.level + 1}: {LEVELS[level.level].name}
        </p>
      )}
      {isMaxLevel && (
        <p className="text-[10px] text-success mt-1.5 text-center font-medium">
          Max Level Reached!
        </p>
      )}
    </div>
  );
}
