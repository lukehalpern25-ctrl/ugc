"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CONTRACT_TEXT } from "@/lib/gymdex/contract";
import CursiveSignature from "./CursiveSignature";

export default function ContractForm() {
  const router = useRouter();
  const [legalName, setLegalName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSign = legalName.trim().length >= 2 && agreed && !loading;

  const handleSign = async () => {
    if (!canSign) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/gymdex/contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legal_name: legalName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to sign contract");
      }

      const { id } = await res.json();
      localStorage.setItem("gymdex-creator-id", id);
      router.push("/gymdex/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div id="contract" className="scroll-mt-8">
      {/* Contract text */}
      <div className="rounded-xl border border-border bg-surface p-1">
        <div className="max-h-64 overflow-y-auto p-4 text-sm text-muted leading-relaxed whitespace-pre-line no-scrollbar">
          {CONTRACT_TEXT}
        </div>
      </div>

      {/* Name input */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Your Legal Full Name
        </label>
        <input
          type="text"
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
          placeholder="John Smith"
          className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
          disabled={loading}
        />
      </div>

      {/* Signature preview */}
      <CursiveSignature name={legalName} />

      {/* Agreement checkbox */}
      <label className="flex items-start gap-3 mt-5 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary accent-primary"
          disabled={loading}
        />
        <span className="text-sm text-muted leading-relaxed">
          I have read and agree to the Creator Agreement above. I understand this
          is a binding contract.
        </span>
      </label>

      {/* Error */}
      {error && (
        <p className="mt-3 text-sm text-danger">{error}</p>
      )}

      {/* Sign button */}
      <button
        onClick={handleSign}
        disabled={!canSign}
        className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all ${
          canSign
            ? "bg-primary text-white hover:bg-primary-dark active:scale-[0.98]"
            : "bg-surface text-muted cursor-not-allowed"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing...
          </span>
        ) : (
          "Sign & Get Started"
        )}
      </button>
    </div>
  );
}
