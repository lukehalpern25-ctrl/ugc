"use client";

import { Section } from "@/lib/steps";
import { getIcon } from "@/lib/icons";
import StepSection from "./StepSection";

interface SectionBlockProps {
  section: Section;
  completedItems: Set<string>;
  watchedVideos: Set<string>;
  activeSectionId: number;
  onToggle: (id: string) => void;
  onVideoWatched: (id: string) => void;
}

export default function SectionBlock({
  section,
  completedItems,
  watchedVideos,
  activeSectionId,
  onToggle,
  onVideoWatched,
}: SectionBlockProps) {
  const isActive = section.id === activeSectionId;
  const isLocked = section.id > activeSectionId;
  const isSectionComplete = section.steps.every((step) =>
    step.items.every((item) => completedItems.has(item.id))
  );

  // Determine which step within this section is active
  const getActiveStepInSection = () => {
    for (const step of section.steps) {
      if (!step.items.every((item) => completedItems.has(item.id))) {
        return step.id;
      }
    }
    return section.steps[section.steps.length - 1].id;
  };

  const activeStepInSection = getActiveStepInSection();

  return (
    <div className={isLocked ? "opacity-50" : ""}>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${
            isSectionComplete
              ? "bg-success/20 border border-success/30"
              : isActive
              ? "bg-primary/20 border border-primary/30"
              : "bg-surface border border-border"
          }`}
        >
          {isSectionComplete ? (
            <svg
              className="w-5 h-5 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (() => {
            const Icon = getIcon(section.icon);
            return Icon ? (
              <Icon size={20} className={isActive ? "text-primary-light" : "text-muted"} />
            ) : null;
          })()}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
          <p className="text-sm text-muted">{section.subtitle}</p>
        </div>
      </div>

      {/* Steps within section */}
      <div className="space-y-6">
        {section.steps.map((step) => {
          const isStepActive = isActive && step.id === activeStepInSection;
          const isStepLocked =
            isLocked ||
            (isActive && step.id > activeStepInSection);

          return (
            <div key={step.id}>
              <StepSection
                step={step}
                completedItems={completedItems}
                watchedVideos={watchedVideos}
                isStepActive={isStepActive || completedItems.has(step.items[0]?.id)}
                isStepLocked={isStepLocked}
                onToggle={onToggle}
                onVideoWatched={onVideoWatched}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
