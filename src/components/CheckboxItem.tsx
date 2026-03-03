"use client";

import { useRef, useCallback, useState } from "react";
import Image from "next/image";
import { StepItem } from "@/lib/steps";
import InlineVideo from "./InlineVideo";

interface CheckboxItemProps {
  item: StepItem;
  isChecked: boolean;
  isLocked: boolean;
  videoWatched: boolean;
  onToggle: (id: string) => void;
  onVideoWatched: (id: string) => void;
}

export default function CheckboxItem({
  item,
  isChecked,
  isLocked,
  videoWatched,
  onToggle,
  onVideoWatched,
}: CheckboxItemProps) {
  const hasVideo = !!item.video;
  const needsVideoWatch = hasVideo && !videoWatched && !isChecked;
  const checkboxDisabled = isLocked || needsVideoWatch;
  const hasPlayedOnceRef = useRef(false);
  const lastTimeRef = useRef(0);
  const maxTimeRef = useRef(0);

  const handleSeeking = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      if (video.currentTime > maxTimeRef.current + 0.5) {
        video.currentTime = maxTimeRef.current;
      }
    },
    []
  );

  const handleProgress = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      if (video.currentTime > maxTimeRef.current) {
        maxTimeRef.current = video.currentTime;
      }
    },
    []
  );

  const handleTimeUpdate = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      if (hasPlayedOnceRef.current || videoWatched) return;
      const video = e.currentTarget;
      // Detect loop restart: current time jumps backward significantly
      if (lastTimeRef.current > 0 && video.currentTime < lastTimeRef.current - 0.5) {
        hasPlayedOnceRef.current = true;
        onVideoWatched(item.id);
        if (item.autoCheckOnWatch && !isChecked) {
          onToggle(item.id);
        }
      }
      lastTimeRef.current = video.currentTime;
    },
    [videoWatched, onVideoWatched, item.id, item.autoCheckOnWatch, isChecked, onToggle]
  );

  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${
        isLocked
          ? "border-border/50 bg-surface/30 opacity-50"
          : isChecked
          ? "border-success/30 bg-success/5"
          : item.important
          ? "border-primary/50 bg-surface step-glow"
          : "border-border bg-surface"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => !checkboxDisabled && onToggle(item.id)}
            disabled={checkboxDisabled}
            className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
              isChecked
                ? "bg-success border-success"
                : checkboxDisabled
                ? "border-border/50 cursor-not-allowed"
                : "border-primary hover:border-primary-light hover:bg-primary/10 active:scale-90 cursor-pointer"
            }`}
          >
            {isChecked && (
              <svg
                className="w-4 h-4 text-white check-animate"
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
            )}
            {isLocked && !isChecked && (
              <svg
                className="w-3.5 h-3.5 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            )}
            {needsVideoWatch && !isLocked && (
              <svg
                className="w-3.5 h-3.5 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4
              className={`font-semibold text-base transition-colors ${
                isChecked
                  ? "text-success line-through"
                  : item.important
                  ? "text-primary-light"
                  : "text-foreground"
              }`}
            >
              {item.title}
            </h4>

            {/* Image — shown small, above description */}
            {item.image && !isLocked && (
              <div className="mt-2 mb-2 rounded-lg overflow-hidden border border-border max-w-[75%] mx-auto">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            )}

            <p className="text-sm text-muted mt-1 leading-relaxed">
              {item.description}
            </p>

            {/* Link button */}
            {item.link && !isLocked && (
              <a
                href={item.link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                {item.link.label}
              </a>
            )}

            {/* Details list */}
            {item.details && !isLocked && !item.copyableDetails && (
              <ul className="mt-3 space-y-1.5">
                {item.details.map((detail, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted/80 flex items-start gap-2"
                  >
                    <span className="text-primary mt-0.5 flex-shrink-0">
                      &bull;
                    </span>
                    {detail}
                  </li>
                ))}
              </ul>
            )}

            {/* Copyable details */}
            {item.details && !isLocked && item.copyableDetails && (
              <CopyableOptions details={item.details} />
            )}

            {/* Video */}
            {item.video && !isLocked && (
              <div className="mt-3">
                <div className="rounded-lg overflow-hidden border border-border bg-surface-light max-w-[75%] mx-auto">
                  <InlineVideo
                    src={item.video}
                    className="w-full"
                    muted={item.videoMuted}
                    loop={item.videoLoop}
                    autoPlay={item.videoLoop}
                    onEnded={() => {
                      onVideoWatched(item.id);
                      if (item.autoCheckOnWatch && !isChecked) {
                        onToggle(item.id);
                      }
                    }}
                    onSeeking={handleSeeking}
                    onTimeUpdate={(e) => {
                      handleProgress(e);
                      if (item.videoLoop) handleTimeUpdate(e);
                    }}
                  />
                </div>
                {needsVideoWatch && !item.gotItButton && (
                  <div className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <svg
                      className="w-4 h-4 text-amber-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-xs text-amber-400 font-medium">
                      Watch the full video to continue
                    </p>
                  </div>
                )}
                {item.gotItButton && videoWatched && !isChecked && (
                  <button
                    onClick={() => onToggle(item.id)}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary/10 border border-primary/30 text-primary-light font-semibold text-sm hover:bg-primary/20 active:scale-[0.98] transition-all"
                  >
                    Got it.
                  </button>
                )}
                {videoWatched && !isChecked && !item.gotItButton && (
                  <div className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg">
                    <svg
                      className="w-4 h-4 text-success flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="text-xs text-success font-medium">
                      Video watched — check the box to continue
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pro tip */}
            {item.tip && !isLocked && (
              <div className="mt-3 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm text-primary-light">
                  <span className="font-semibold">Pro tip:</span> {item.tip}
                </p>
              </div>
            )}
            {/* Bottom checkbox for long cards */}
            {item.bottomCheckbox && !isLocked && !isChecked && !needsVideoWatch && (
              <button
                onClick={() => onToggle(item.id)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-success/10 border border-success/30 text-success font-semibold text-sm hover:bg-success/20 active:scale-[0.98] transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Mark as done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyableOptions({ details }: { details: string[] }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="mt-3 space-y-2">
      {details.map((detail, i) => (
        <button
          key={i}
          onClick={() => handleCopy(detail, i)}
          className="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-surface-light border border-border rounded-lg text-left hover:border-primary/50 active:scale-[0.98] transition-all"
        >
          <span className="text-sm text-foreground">&ldquo;{detail}&rdquo;</span>
          <span className="flex-shrink-0">
            {copiedIndex === i ? (
              <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
