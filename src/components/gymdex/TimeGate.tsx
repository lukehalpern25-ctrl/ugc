"use client";

import { useState, useEffect } from "react";

interface TimeGateProps {
  unlockTime: Date;
  label?: string;
}

export default function TimeGate({ unlockTime, label = "Unlocks in" }: TimeGateProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    function update() {
      const now = Date.now();
      const diff = unlockTime.getTime() - now;

      if (diff <= 0) {
        setIsUnlocked(true);
        setTimeLeft("");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [unlockTime]);

  if (isUnlocked) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-xl countdown-pulse">
      <svg
        className="w-5 h-5 text-muted flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div>
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="text-lg font-mono font-bold text-foreground">{timeLeft}</p>
      </div>
    </div>
  );
}
