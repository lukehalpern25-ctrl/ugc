"use client";

import { useState, useCallback, useEffect } from "react";
import { sections, getTotalItemCount } from "@/lib/steps";
import type { CreatorProgress } from "@/lib/gymdex/types";
import SectionBlock from "@/components/SectionBlock";
import ProgressBar from "@/components/ProgressBar";
import ResourcesTab from "@/components/ResourcesTab";

interface PostingPhaseProps {
  creatorId: string;
  progress: CreatorProgress[];
  onComplete: () => void;
  onRefetch: () => void;
}

export default function PostingPhase({
  creatorId,
  progress,
  onComplete,
  onRefetch,
}: PostingPhaseProps) {
  const [activeTab, setActiveTab] = useState<"steps" | "resources">("steps");
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());

  // Initialize from server progress
  useEffect(() => {
    const serverCompleted = new Set(
      progress.filter((p) => p.phase === "posting").map((p) => p.step_id)
    );
    setCompletedItems(serverCompleted);

    // Also load watched videos from localStorage (video watching is client-only)
    const watched = localStorage.getItem("gymdex-posting-watched");
    if (watched) {
      try {
        setWatchedVideos(new Set(JSON.parse(watched)));
      } catch {
        // ignore
      }
    }
  }, [progress]);

  // Save watched videos to localStorage
  useEffect(() => {
    if (watchedVideos.size > 0) {
      localStorage.setItem(
        "gymdex-posting-watched",
        JSON.stringify(Array.from(watchedVideos))
      );
    }
  }, [watchedVideos]);

  const activeSectionId = (() => {
    for (const section of sections) {
      const allCompleted = section.steps.every((step) =>
        step.items.every((item) => completedItems.has(item.id))
      );
      if (!allCompleted) return section.id;
    }
    return sections.length;
  })();

  const handleToggle = useCallback(
    async (id: string) => {
      const wasChecked = completedItems.has(id);

      // Optimistic update
      setCompletedItems((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });

      if (!wasChecked) {
        // Sync to server
        try {
          const res = await fetch(`/api/gymdex/creator/${creatorId}/progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phase: "posting", step_id: id }),
          });

          const data = await res.json();
          if (data.advancement?.advanced) {
            onComplete();
          }
        } catch {
          // Revert on error
          setCompletedItems((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      }
    },
    [completedItems, creatorId, onComplete]
  );

  const handleVideoWatched = useCallback((id: string) => {
    setWatchedVideos((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground">Posting Guide</h2>
        <p className="text-sm text-muted">
          Learn exactly how to create and post your videos
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border mb-4">
        <button
          onClick={() => setActiveTab("steps")}
          className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${
            activeTab === "steps"
              ? "border-primary text-primary-light"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Instructions
        </button>
        <button
          onClick={() => setActiveTab("resources")}
          className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${
            activeTab === "resources"
              ? "border-primary text-primary-light"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Resources
        </button>
      </div>

      {activeTab === "steps" && completedItems.size > 0 && (
        <ProgressBar completedItems={completedItems} />
      )}

      {activeTab === "steps" ? (
        <div className="space-y-10">
          {sections.map((section) => {
            const allPreviousComplete = sections
              .filter((s) => s.id < section.id)
              .every((s) =>
                s.steps.every((step) =>
                  step.items.every((item) => completedItems.has(item.id))
                )
              );

            return (
              <SectionBlock
                key={section.id}
                section={section}
                completedItems={completedItems}
                watchedVideos={watchedVideos}
                activeSectionId={activeSectionId}
                allPreviousSectionsComplete={allPreviousComplete}
                onToggle={handleToggle}
                onVideoWatched={handleVideoWatched}
              />
            );
          })}

          {completedItems.size === getTotalItemCount() && (
            <div className="text-center rounded-xl border border-success/30 bg-success/5 p-6">
              <h3 className="text-xl font-bold text-success mb-2">
                Guide Complete!
              </h3>
              <p className="text-sm text-muted">
                You&apos;re ready to start posting. Your dashboard will update
                shortly.
              </p>
            </div>
          )}
        </div>
      ) : (
        <ResourcesTab />
      )}
    </div>
  );
}
