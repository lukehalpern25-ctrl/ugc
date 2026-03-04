"use client";

import { useState, useCallback } from "react";
import { setupPhase } from "@/lib/gymdex/phases";
import type { CreatorProfile, CreatorProgress } from "@/lib/gymdex/types";

interface SetupPhaseProps {
  creatorId: string;
  profile: CreatorProfile;
  progress: CreatorProgress[];
  onComplete: () => void;
  onRefetch: () => void;
}

export default function SetupPhase({
  creatorId,
  profile,
  progress,
  onComplete,
  onRefetch,
}: SetupPhaseProps) {
  const [values, setValues] = useState<Record<string, string>>({
    email: profile.email || "",
    phone: profile.phone || "",
    tiktok_url: profile.tiktok_url || "",
    instagram_url: profile.instagram_url || "",
  });
  const [saving, setSaving] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showExamples, setShowExamples] = useState(false);

  const completedSteps = new Set(
    progress.filter((p) => p.phase === "setup").map((p) => p.step_id)
  );

  const handleSaveField = useCallback(
    async (stepId: string, field: string, value: string) => {
      if (!value.trim()) return;
      setSaving(stepId);
      setErrors((prev) => ({ ...prev, [stepId]: "" }));

      try {
        // Determine which API endpoint to use
        let endpoint: string;
        let body: Record<string, string>;

        if (["email", "phone", "payment_method", "payment_handle"].includes(field)) {
          endpoint = `/api/gymdex/creator/${creatorId}/profile`;
          body = { [field]: value.trim() };
        } else {
          endpoint = `/api/gymdex/creator/${creatorId}/accounts`;
          body = { [field]: value.trim() };
        }

        const res = await fetch(endpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to save");
        }

        // Mark step as completed
        await fetch(`/api/gymdex/creator/${creatorId}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phase: "setup", step_id: stepId }),
        });

        onRefetch();
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          [stepId]: err instanceof Error ? err.message : "Failed to save",
        }));
      } finally {
        setSaving(null);
      }
    },
    [creatorId, onRefetch]
  );

  const handleCheckboxStep = useCallback(
    async (stepId: string) => {
      setSaving(stepId);
      try {
        const res = await fetch(`/api/gymdex/creator/${creatorId}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phase: "setup", step_id: stepId }),
        });

        const data = await res.json();
        if (data.advancement?.advanced) {
          onComplete();
        } else {
          onRefetch();
        }
      } catch {
        setErrors((prev) => ({ ...prev, [stepId]: "Failed to save" }));
      } finally {
        setSaving(null);
      }
    },
    [creatorId, onComplete, onRefetch]
  );

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground">{setupPhase.title}</h2>
        <p className="text-sm text-muted">{setupPhase.subtitle}</p>
      </div>

      {setupPhase.steps.map((step, index) => {
        const isCompleted = completedSteps.has(step.id);
        // Steps unlock sequentially
        const previousSteps = setupPhase.steps.slice(0, index);
        const isLocked = previousSteps.some(
          (ps) => ps.required && !completedSteps.has(ps.id)
        );
        const isSaving = saving === step.id;

        return (
          <div
            key={step.id}
            className={`rounded-xl border transition-all ${
              isCompleted
                ? "border-success/30 bg-success/5"
                : isLocked
                ? "border-border/50 bg-surface/30 opacity-50"
                : "border-border bg-surface"
            }`}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Status indicator */}
                <div
                  className={`mt-0.5 w-7 h-7 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                    isCompleted
                      ? "bg-success border-success"
                      : isLocked
                      ? "border-border/50"
                      : "border-primary"
                  }`}
                >
                  {isCompleted && (
                    <svg className="w-4 h-4 text-white check-animate" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isLocked && !isCompleted && (
                    <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-semibold text-base ${
                      isCompleted ? "text-success line-through" : "text-foreground"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-sm text-muted mt-0.5">{step.description}</p>

                  {/* Input fields */}
                  {!isCompleted && !isLocked && step.type === "input" && step.field && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type={step.field === "email" ? "email" : "text"}
                        value={values[step.field] || ""}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [step.field!]: e.target.value }))
                        }
                        placeholder={step.placeholder}
                        className="flex-1 px-3 py-2 rounded-lg bg-surface-light border border-border text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => handleSaveField(step.id, step.field!, values[step.field!] || "")}
                        disabled={isSaving || !values[step.field!]?.trim()}
                        className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? "..." : "Save"}
                      </button>
                    </div>
                  )}

                  {/* Select fields */}
                  {!isCompleted && !isLocked && step.type === "select" && step.options && step.field && (
                    <div className="mt-3 flex gap-2">
                      <div className="flex-1 flex gap-2">
                        {step.options.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setValues((prev) => ({ ...prev, [step.field!]: opt.value }));
                              handleSaveField(step.id, step.field!, opt.value);
                            }}
                            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                              values[step.field!] === opt.value
                                ? "border-primary bg-primary/10 text-primary-light"
                                : "border-border bg-surface-light text-muted hover:border-primary/50"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* URL fields */}
                  {!isCompleted && !isLocked && step.type === "url" && step.field && (
                    <div className="mt-3">
                      {step.details && (
                        <ul className="space-y-1.5 mb-3">
                          {step.details.map((detail, i) => (
                            <li key={i} className="text-sm text-muted flex items-start gap-2">
                              <span className="text-primary mt-0.5">&bull;</span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex gap-2">
                      <input
                        type="url"
                        value={values[step.field] || ""}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [step.field!]: e.target.value }))
                        }
                        placeholder={step.placeholder}
                        className="flex-1 px-3 py-2 rounded-lg bg-surface-light border border-border text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => handleSaveField(step.id, step.field!, values[step.field!] || "")}
                        disabled={isSaving || !values[step.field!]?.trim()}
                        className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? "..." : "Save"}
                      </button>
                      </div>
                    </div>
                  )}

                  {/* Checkbox with details */}
                  {!isCompleted && !isLocked && step.type === "checkbox" && step.details && (
                    <div className="mt-3">
                      <ul className="space-y-1.5 mb-3">
                        {step.details.map((detail, i) => {
                          const isBioLine = step.examples && detail.toLowerCase().includes("bio");
                          return (
                            <li key={i} className="text-sm text-muted flex items-start gap-2">
                              <span className="text-primary mt-0.5">&bull;</span>
                              <span>
                                {detail}
                                {isBioLine && (
                                  <>
                                    {" "}
                                    <button
                                      type="button"
                                      onClick={() => setShowExamples(!showExamples)}
                                      className="text-xs text-primary-light font-medium hover:text-primary transition-colors"
                                    >
                                      {showExamples ? "(hide)" : "(bio examples)"}
                                    </button>
                                  </>
                                )}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      {step.examples && showExamples && (
                        <div className="mb-3 grid grid-cols-2 gap-1.5">
                          {step.examples.map((ex, i) => (
                            <div
                              key={i}
                              className="px-3 py-2 bg-surface-light border border-border rounded-lg text-xs text-muted"
                            >
                              {ex}
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => handleCheckboxStep(step.id)}
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-success/10 border border-success/30 text-success font-semibold text-sm hover:bg-success/20 active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : "Confirm — All Done"}
                      </button>
                    </div>
                  )}

                  {/* Error */}
                  {errors[step.id] && (
                    <p className="text-xs text-danger mt-2">{errors[step.id]}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
