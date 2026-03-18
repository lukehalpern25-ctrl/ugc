"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAnalytics } from "@/lib/hooks/useAnalytics";

interface ContractData {
  legal_name: string;
  payment_method: string;
  payment_handle: string;
}

export default function CreateAccountPage() {
  const router = useRouter();
  const { track, trackPageView } = useAnalytics();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contractData, setContractData] = useState<ContractData | null>(null);

  // Track page view
  useEffect(() => {
    trackPageView("/gymdex/create-account");
  }, [trackPageView]);

  // Load contract data from sessionStorage
  useEffect(() => {
    const data = sessionStorage.getItem("gymdex-contract-data");
    if (!data) {
      // No contract data, redirect back to contract page
      router.replace("/gymdex");
      return;
    }
    try {
      setContractData(JSON.parse(data));
    } catch {
      router.replace("/gymdex");
    }
  }, [router]);

  // If already signed, redirect to dashboard
  useEffect(() => {
    const id = localStorage.getItem("gymdex-creator-id");
    if (id) {
      router.replace("/gymdex/dashboard");
    }
  }, [router]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = password.length >= 6;
  const passwordsMatch = password === confirmPassword;

  const canSubmit =
    isValidEmail &&
    isValidPassword &&
    passwordsMatch &&
    contractData &&
    !loading;

  const handleSubmit = async () => {
    if (!canSubmit || !contractData) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/gymdex/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          legal_name: contractData.legal_name,
          payment_method: contractData.payment_method,
          payment_handle: contractData.payment_handle,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create account");
      }

      const { id } = await res.json();

      // Clear contract data from sessionStorage
      sessionStorage.removeItem("gymdex-contract-data");

      // Store creator ID
      localStorage.setItem("gymdex-creator-id", id);

      track("account_created", { creator_id: id });
      router.push("/gymdex/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  if (!contractData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface/50 border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-center gap-3">
          <Image
            src="/icon.webp"
            alt="Gymdex"
            width={40}
            height={40}
            className="rounded-xl"
          />
          <div>
            <h1 className="text-lg font-bold text-foreground">Gymdex</h1>
            <p className="text-xs text-muted">Creator Program</p>
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
          <p className="text-muted mt-2">
            Set up your login credentials to access your creator dashboard
          </p>
        </div>

        <div className="space-y-4">
          {/* Email input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
              disabled={loading}
            />
            {email && !isValidEmail && (
              <p className="mt-1 text-xs text-danger">Please enter a valid email address</p>
            )}
          </div>

          {/* Password input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
              disabled={loading}
            />
            {password && !isValidPassword && (
              <p className="mt-1 text-xs text-danger">Password must be at least 6 characters</p>
            )}
          </div>

          {/* Confirm password input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            {confirmPassword && !passwordsMatch && (
              <p className="mt-1 text-xs text-danger">Passwords do not match</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              canSubmit
                ? "bg-primary text-white hover:bg-primary-dark active:scale-[0.98]"
                : "bg-surface text-muted cursor-not-allowed"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </div>

        {/* Contract summary */}
        <div className="mt-8 p-4 rounded-xl bg-surface border border-border">
          <p className="text-xs text-muted mb-2">Contract signed by:</p>
          <p className="text-sm font-medium text-foreground">{contractData.legal_name}</p>
          <p className="text-xs text-muted mt-1">
            Payment: {contractData.payment_method} ({contractData.payment_handle})
          </p>
        </div>
      </main>
    </div>
  );
}
