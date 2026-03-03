"use client";

import { TIERS, getTier } from "@/lib/gymdex/constants";
import type { PerformanceTier as TierType } from "@/lib/gymdex/types";

interface PerformanceTierProps {
  tier: TierType;
}

export default function PerformanceTier({ tier }: PerformanceTierProps) {
  const currentTier = getTier(tier);
  const currentIndex = TIERS.findIndex((t) => t.id === tier);
  const nextTier = currentIndex < TIERS.length - 1 ? TIERS[currentIndex + 1] : null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="text-sm font-bold text-foreground mb-3">Performance Tier</h3>

      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
          style={{
            backgroundColor: `${currentTier?.color}20`,
            borderColor: `${currentTier?.color}50`,
            borderWidth: 2,
          }}
        >
          {currentIndex === 0 ? "⭐" : currentIndex === 1 ? "🌟" : currentIndex === 2 ? "💎" : "👑"}
        </div>
        <div>
          <p className="font-bold text-foreground">{currentTier?.name}</p>
          <p className="text-xs text-muted">${currentTier?.monthlyPay}/mo</p>
        </div>
      </div>

      {nextTier && (
        <div className="px-3 py-2 bg-primary/5 border border-primary/10 rounded-lg">
          <p className="text-xs text-muted">
            <span className="font-medium text-primary-light">Next: {nextTier.name}</span>
            {" — "}${nextTier.monthlyPay}/mo
          </p>
          <p className="text-[10px] text-muted mt-0.5">{nextTier.requirement}</p>
        </div>
      )}

      {!nextTier && (
        <p className="text-xs text-success text-center font-medium">
          You&apos;re at the top tier!
        </p>
      )}
    </div>
  );
}
