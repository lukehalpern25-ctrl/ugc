"use client";

import { useState, useCallback, useEffect } from "react";
import type { CreatorProgress } from "@/lib/gymdex/types";

interface DownloadPhaseProps {
  creatorId: string;
  progress: CreatorProgress[];
  onComplete: () => void;
  onRefetch: () => void;
}

const STEPS = [
  {
    id: "download-testflight",
    title: "Download TestFlight",
    description: "TestFlight is Apple's app for testing beta apps. You'll need it to install the Gymdex UGC app.",
    linkText: "Open App Store",
    linkUrl: "https://apps.apple.com/us/app/testflight/id899247664",
  },
  {
    id: "download-gymdex-ugc",
    title: "Install Gymdex UGC App",
    description: "Use TestFlight to download and install the Gymdex UGC app. This is where you'll post content and track earnings.",
    linkText: "Open in TestFlight",
    linkUrl: "https://testflight.apple.com/join/pXUKZJXn",
  },
];

export default function DownloadPhase({
  creatorId,
  progress,
  onComplete,
}: DownloadPhaseProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  // Initialize from server progress
  useEffect(() => {
    const serverCompleted = new Set(
      progress.filter((p) => p.phase === "posting").map((p) => p.step_id)
    );
    setCompletedSteps(serverCompleted);
  }, [progress]);

  const handleToggle = useCallback(
    async (stepId: string) => {
      if (completedSteps.has(stepId) || loading) return;

      setLoading(stepId);

      // Optimistic update
      setCompletedSteps((prev) => new Set([...prev, stepId]));

      try {
        const res = await fetch(`/api/gymdex/creator/${creatorId}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phase: "posting", step_id: stepId }),
        });

        const data = await res.json();
        if (data.advancement?.advanced) {
          onComplete();
        }
      } catch {
        // Revert on error
        setCompletedSteps((prev) => {
          const next = new Set(prev);
          next.delete(stepId);
          return next;
        });
      } finally {
        setLoading(null);
      }
    },
    [completedSteps, creatorId, loading, onComplete]
  );

  const allComplete = STEPS.every((step) => completedSteps.has(step.id));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Download the App</h2>
        <p className="text-sm text-muted">
          Get the Gymdex UGC app to start posting and earning
        </p>
      </div>

      <div className="space-y-4">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.has(step.id);
          const isLoading = loading === step.id;
          const previousComplete = index === 0 || completedSteps.has(STEPS[index - 1].id);

          return (
            <div
              key={step.id}
              className={`rounded-xl border p-4 transition-all ${
                isCompleted
                  ? "border-success/30 bg-success/5"
                  : previousComplete
                  ? "border-primary/30 bg-surface"
                  : "border-border bg-surface opacity-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      isCompleted
                        ? "bg-success text-white"
                        : "bg-surface-light text-muted border border-border"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold ${isCompleted ? "text-success" : "text-foreground"}`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted mt-1">{step.description}</p>

                  {!isCompleted && previousComplete && (
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <a
                        href={step.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {step.linkText}
                      </a>
                      <button
                        onClick={() => handleToggle(step.id)}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-surface-light border border-border text-foreground font-medium rounded-lg hover:bg-surface transition-colors text-sm disabled:opacity-50"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-muted/30 border-t-muted rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        Mark as Done
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {allComplete && (
        <div className="mt-6 text-center rounded-xl border border-success/30 bg-success/5 p-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-success/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-success mb-2">You&apos;re All Set!</h3>
          <p className="text-sm text-muted mb-4">
            Open the Gymdex UGC app to view posting guidelines, track your progress, and manage payments.
          </p>
          <a
            href="https://testflight.apple.com/join/pXUKZJXn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
          >
            Open Gymdex UGC App
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
