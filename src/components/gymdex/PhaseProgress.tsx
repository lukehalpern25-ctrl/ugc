"use client";

import { PHASE_ORDER } from "@/lib/gymdex/phases";
import type { Phase } from "@/lib/gymdex/types";

interface PhaseProgressProps {
  currentPhase: Phase;
}

export default function PhaseProgress({ currentPhase }: PhaseProgressProps) {
  const currentIndex = PHASE_ORDER.findIndex((p) => p.id === currentPhase);

  return (
    <div className="flex items-center justify-between gap-1">
      {PHASE_ORDER.map((phase, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isLocked = i > currentIndex;

        return (
          <div key={phase.id} className="flex-1 flex flex-col items-center gap-1.5">
            {/* Connector + Circle */}
            <div className="flex items-center w-full">
              {i > 0 && (
                <div
                  className={`flex-1 h-0.5 ${
                    isComplete ? "bg-success" : "bg-border"
                  }`}
                />
              )}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all ${
                  isComplete
                    ? "bg-success/20 border-2 border-success"
                    : isCurrent
                    ? "bg-primary/20 border-2 border-primary step-glow"
                    : "bg-surface border-2 border-border"
                }`}
              >
                {isComplete ? (
                  <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={isLocked ? "opacity-40" : ""}>{phase.icon}</span>
                )}
              </div>
              {i < PHASE_ORDER.length - 1 && (
                <div
                  className={`flex-1 h-0.5 ${
                    isComplete ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </div>
            <span
              className={`text-[10px] font-medium ${
                isComplete
                  ? "text-success"
                  : isCurrent
                  ? "text-primary-light"
                  : "text-muted/50"
              }`}
            >
              {phase.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
