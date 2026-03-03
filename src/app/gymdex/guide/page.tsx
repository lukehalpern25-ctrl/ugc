"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { sections, getTotalItemCount } from "@/lib/steps";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import SectionBlock from "@/components/SectionBlock";
import ResourcesTab from "@/components/ResourcesTab";

const STORAGE_KEY = "gymdex-ugc-progress";
const WATCHED_KEY = "gymdex-ugc-watched";

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<"steps" | "resources">("steps");
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCompletedItems(new Set(JSON.parse(saved)));
      } catch {
        // ignore corrupted data
      }
    }
    const watched = localStorage.getItem(WATCHED_KEY);
    if (watched) {
      try {
        setWatchedVideos(new Set(JSON.parse(watched)));
      } catch {
        // ignore corrupted data
      }
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Array.from(completedItems))
    );
  }, [completedItems]);

  useEffect(() => {
    localStorage.setItem(
      WATCHED_KEY,
      JSON.stringify(Array.from(watchedVideos))
    );
  }, [watchedVideos]);

  // Determine which section is currently active
  const activeSectionId = (() => {
    for (const section of sections) {
      const allCompleted = section.steps.every((step) =>
        step.items.every((item) => completedItems.has(item.id))
      );
      if (!allCompleted) return section.id;
    }
    return sections.length; // all done
  })();

  const handleToggle = useCallback((id: string) => {
    setCompletedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleVideoWatched = useCallback((id: string) => {
    setWatchedVideos((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setCompletedItems(new Set());
    setWatchedVideos(new Set());
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(WATCHED_KEY);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "steps" && completedItems.size > 0 && <ProgressBar completedItems={completedItems} />}

      {activeTab === "steps" ? (
        <main className="max-w-lg mx-auto px-4 py-6 space-y-10 pb-24">
          {/* Welcome */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Welcome, Creator!
            </h2>
            <ul className="text-sm text-muted space-y-1.5 max-w-sm mx-auto">
              <li>Complete each step in order</li>
              <li>Check off items as you go</li>
              <li>Your progress saves automatically</li>
            </ul>
          </div>

          {/* Sections */}
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

          {/* All done banner */}
          {completedItems.size === getTotalItemCount() && (
            <a
              href="sms:"
              className="block text-center rounded-xl border border-success/30 bg-success/5 p-6 active:scale-[0.98] transition-transform"
            >
              <Image
                src="/images/imessage-icon.svg"
                alt="iMessage"
                width={64}
                height={64}
                className="mx-auto mb-3"
              />
              <h3 className="text-xl font-bold text-success mb-2">
                All Done!
              </h3>
              <p className="text-sm text-muted mb-4">
                Send us a message on iMessage to let us know you&apos;re finished!
              </p>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-success text-white font-semibold text-sm rounded-lg">
                Open iMessage
              </span>
            </a>
          )}

          {/* Reset button */}
          {completedItems.size > 0 && (
            <div className="text-center pt-4">
              <button
                onClick={handleReset}
                className="text-sm text-muted hover:text-foreground transition-colors underline underline-offset-2"
              >
                Reset all progress
              </button>
            </div>
          )}
        </main>
      ) : (
        <ResourcesTab />
      )}
    </div>
  );
}
