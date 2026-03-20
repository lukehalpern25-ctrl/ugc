"use client";

import { useState } from "react";
import type { WarmupDayDef } from "@/lib/gymdex/phases";
import { useAnalytics } from "@/lib/hooks/useAnalytics";

interface WarmupDayCardProps {
  dayDef: WarmupDayDef;
  completedTasks: Set<string>;
  isUnlocked: boolean;
  isCompleted: boolean;
  creatorId: string;
  onTaskComplete: () => void;
  payment: number;
}

export default function WarmupDayCard({
  dayDef,
  completedTasks,
  isUnlocked,
  isCompleted,
  creatorId,
  onTaskComplete,
  payment,
}: WarmupDayCardProps) {
  const { track } = useAnalytics();
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleCompleteTask = async (taskId: string) => {
    setSaving(taskId);
    setError("");

    try {
      const res = await fetch(`/api/gymdex/creator/${creatorId}/warmup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day_number: dayDef.day, task_id: taskId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      track("warmup_task_completed", { day: dayDef.day, task_id: taskId });
      onTaskComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all ${
        isCompleted
          ? "border-success/30 bg-success/5"
          : !isUnlocked
          ? "border-border/50 bg-surface/30 opacity-50"
          : "border-border bg-surface"
      }`}
    >
      <div className="p-4">
        {/* Day header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                isCompleted
                  ? "bg-success/20 text-success"
                  : isUnlocked
                  ? "bg-primary/20 text-primary-light"
                  : "bg-surface-light text-muted"
              }`}
            >
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                dayDef.day
              )}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">{dayDef.title}</h3>
              <p className="text-xs text-muted">{dayDef.subtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-sm font-bold ${isCompleted ? "text-success" : "text-foreground"}`}>
              +${payment}
            </span>
            <span className="block text-xs text-muted">
              {dayDef.tasks.filter((t) => completedTasks.has(t.id)).length}/{dayDef.tasks.length} tasks
            </span>
          </div>
        </div>

        {/* Tasks */}
        {isUnlocked && (
          <div className="space-y-2">
            {dayDef.tasks.map((task) => {
              const isDone = completedTasks.has(task.id);
              const isSavingThis = saving === task.id;
              const isOptional = task.id === "d3-post";

              return (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    isDone ? "bg-success/5" : "bg-surface-light"
                  }`}
                >
                  <button
                    onClick={() => !isDone && !isSavingThis && handleCompleteTask(task.id)}
                    disabled={isDone || isSavingThis}
                    className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isDone
                        ? "bg-success border-success"
                        : "border-primary hover:bg-primary/10 cursor-pointer"
                    }`}
                  >
                    {isDone && (
                      <svg className="w-3.5 h-3.5 text-white check-animate" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {isSavingThis && (
                      <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isDone ? "text-success line-through" : "text-foreground"}`}>
                      {task.title}
                      {isOptional && <span className="text-muted font-normal"> (optional)</span>}
                    </p>
                    <p className="text-xs text-muted mt-0.5">{task.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isUnlocked && (
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-light rounded-lg">
            <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-xs text-muted">This day is locked. Complete previous days first.</p>
          </div>
        )}

        {error && <p className="text-xs text-danger mt-2">{error}</p>}
      </div>
    </div>
  );
}
