"use client";

import { getWeightedProgress, getTotalItemCount } from "@/lib/steps";

interface ProgressBarProps {
  completedItems: Set<string>;
}

export default function ProgressBar({ completedItems }: ProgressBarProps) {
  const percentage = getWeightedProgress(completedItems);
  const isComplete = completedItems.size === getTotalItemCount();

  return (
    <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${isComplete ? "text-success" : "text-muted"}`}>
            Progress
          </span>
          <span className={`text-sm font-bold ${isComplete ? "text-success" : "text-primary-light"}`}>
            {percentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isComplete ? "bg-success" : "progress-bar-shine"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {isComplete && (
          <p className="text-center text-sm text-success mt-2 font-semibold">
            All steps completed! You&apos;re ready to create!
          </p>
        )}
      </div>
    </div>
  );
}
