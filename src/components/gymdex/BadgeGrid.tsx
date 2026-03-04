"use client";

import { BADGES } from "@/lib/gymdex/constants";
import { getIcon } from "@/lib/icons";

interface BadgeGridProps {
  earnedBadges: string[];
}

export default function BadgeGrid({ earnedBadges }: BadgeGridProps) {
  const earnedSet = new Set(earnedBadges);

  const categories = [
    { key: "onboarding", label: "Onboarding" },
    { key: "posting", label: "Posting" },
    { key: "streaks", label: "Streaks" },
    { key: "special", label: "Special" },
  ] as const;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="text-sm font-bold text-foreground mb-3">Badges</h3>

      {categories.map((cat) => {
        const catBadges = BADGES.filter((b) => b.category === cat.key);
        if (catBadges.length === 0) return null;

        return (
          <div key={cat.key} className="mb-3 last:mb-0">
            <p className="text-[10px] text-muted uppercase tracking-wider mb-1.5">
              {cat.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {catBadges.map((badge) => {
                const earned = earnedSet.has(badge.id);
                return (
                  <div
                    key={badge.id}
                    title={earned ? `${badge.name}: ${badge.description}` : `Locked: ${badge.description}`}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                      earned
                        ? "bg-primary/10 border border-primary/30 badge-unlock"
                        : "bg-surface-light border border-border opacity-30 grayscale"
                    }`}
                  >
                    {(() => {
                      const Icon = getIcon(badge.icon);
                      return Icon ? (
                        <Icon size={20} className={earned ? "text-primary-light" : "text-muted"} />
                      ) : null;
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="text-[10px] text-muted mt-2">
        {earnedBadges.length}/{BADGES.length} earned
      </p>
    </div>
  );
}
