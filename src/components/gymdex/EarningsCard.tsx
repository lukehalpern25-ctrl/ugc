"use client";

import { getTier } from "@/lib/gymdex/constants";
import type { CreatorEarnings, PerformanceTier } from "@/lib/gymdex/types";

interface EarningsCardProps {
  tier: PerformanceTier;
  earnings: CreatorEarnings[];
}

export default function EarningsCard({ tier, earnings }: EarningsCardProps) {
  const tierDef = getTier(tier);
  const monthlyPay = tierDef?.monthlyPay || 250;

  // Current month earnings
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const currentEarnings = earnings.find((e) => e.month === currentMonth);

  const totalEarned = earnings.reduce(
    (sum, e) => sum + Number(e.base_amount) + Number(e.bonus_amount),
    0
  );

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">Earnings</h3>
        <span className="text-xs text-muted">
          {tierDef?.name || "Standard"} Tier
        </span>
      </div>

      <div className="text-center py-2">
        <p className="text-3xl font-bold text-success">
          ${monthlyPay}
        </p>
        <p className="text-xs text-muted mt-1">per month</p>
      </div>

      {currentEarnings && (
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-muted">This month</span>
          <span className={`font-medium ${currentEarnings.status === "paid" ? "text-success" : "text-warning"}`}>
            ${(Number(currentEarnings.base_amount) + Number(currentEarnings.bonus_amount)).toFixed(0)}
            {currentEarnings.status === "paid" ? " (paid)" : " (pending)"}
          </span>
        </div>
      )}

      {totalEarned > 0 && (
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted">Total earned</span>
          <span className="font-medium text-foreground">${totalEarned.toFixed(0)}</span>
        </div>
      )}
    </div>
  );
}
