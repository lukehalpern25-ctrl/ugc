"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CONTRACT_TEXT } from "@/lib/gymdex/contract";
import { useAnalytics } from "@/lib/hooks/useAnalytics";

export default function ContractForm() {
  const router = useRouter();
  const { track } = useAnalytics();
  const [legalName, setLegalName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("sideshift");
  const [paymentHandle, setPaymentHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSign =
    legalName.trim().length >= 2 &&
    paymentHandle.trim().length >= 3 &&
    !loading;

  const handleSign = async () => {
    if (!canSign) return;
    setLoading(true);
    setError("");

    try {
      // Store contract data in sessionStorage for the create-account page
      sessionStorage.setItem("gymdex-contract-data", JSON.stringify({
        legal_name: legalName.trim(),
        payment_method: paymentMethod,
        payment_handle: paymentHandle.trim(),
      }));

      track("contract_reviewed");
      router.push("/gymdex/create-account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div id="contract" className="scroll-mt-8">
      {/* Name input */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Full name
        </label>
        <input
          type="text"
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
          placeholder="John Smith"
          className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && handleSign()}
        />
      </div>

      {/* Sideshift username */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          Sideshift username
        </label>
        <input
          type="text"
          value={paymentHandle}
          onChange={(e) => {
            setPaymentMethod("sideshift");
            setPaymentHandle(e.target.value);
          }}
          placeholder="@yourusername"
          className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && handleSign()}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="mt-3 text-sm text-danger">{error}</p>
      )}

      {/* Sign button */}
      <button
        onClick={handleSign}
        disabled={!canSign}
        className={`w-full mt-4 py-4 rounded-xl font-bold text-lg transition-all ${
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
          "Sign & get started"
        )}
      </button>

      {/* Contract text */}
      <div className="mt-6 rounded-xl border border-border bg-surface p-4 max-h-64 overflow-y-auto text-xs text-muted leading-relaxed whitespace-pre-line no-scrollbar">
        {CONTRACT_TEXT}
      </div>

      <p className="text-xs text-muted text-center mt-3">
        By signing above, you agree to the creator agreement
      </p>
    </div>
  );
}
