"use client";

import Image from "next/image";
import { Step } from "@/lib/steps";
import CheckboxItem from "./CheckboxItem";

interface StepSectionProps {
  step: Step;
  completedItems: Set<string>;
  watchedVideos: Set<string>;
  isStepActive: boolean;
  isStepLocked: boolean;
  onToggle: (id: string) => void;
  onVideoWatched: (id: string) => void;
}

export default function StepSection({
  step,
  completedItems,
  watchedVideos,
  isStepActive,
  isStepLocked,
  onToggle,
  onVideoWatched,
}: StepSectionProps) {
  const isCompleted = step.items.every((item) => completedItems.has(item.id));

  const completedCount = step.items.filter((item) =>
    completedItems.has(item.id)
  ).length;

  return (
    <div
      className={`transition-all duration-300 ${
        isStepLocked ? "opacity-60" : ""
      }`}
    >
      {/* Step Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-base ${
            isCompleted
              ? "bg-success/20"
              : isStepActive
              ? "bg-primary/20"
              : "bg-surface"
          }`}
        >
          {isCompleted ? (
            <svg
              className="w-4 h-4 text-success"
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
          ) : step.iconImage ? (
            <Image
              src={step.iconImage}
              alt={step.title}
              width={36}
              height={36}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-sm">{step.icon}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">{step.title}</h3>
            <span className="text-xs text-muted/60">
              {completedCount}/{step.items.length}
            </span>
          </div>
          <p className="text-xs text-muted">{step.subtitle}</p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3 ml-1">
        {step.items.map((item, index) => {
          const previousItems = step.items.slice(0, index);
          const allPreviousInStepCompleted = previousItems.every((prev) =>
            completedItems.has(prev.id)
          );
          const actuallyLocked = isStepLocked || !allPreviousInStepCompleted;

          return (
            <CheckboxItem
              key={item.id}
              item={item}
              isChecked={completedItems.has(item.id)}
              isLocked={actuallyLocked}
              videoWatched={watchedVideos.has(item.id)}
              onToggle={onToggle}
              onVideoWatched={onVideoWatched}
            />
          );
        })}
      </div>
    </div>
  );
}
