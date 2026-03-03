"use client";

import { useState } from "react";
import Image from "next/image";

export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRecover = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/gymdex/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) throw new Error("Failed to send recovery email");

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <Image
            src="/icon.webp"
            alt="Gymdex"
            width={56}
            height={56}
            className="rounded-xl mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground">
            Recover Your Dashboard
          </h1>
          <p className="text-sm text-muted mt-2">
            Enter the email you used during setup and we&apos;ll send you a link to
            access your dashboard.
          </p>
        </div>

        {sent ? (
          <div className="text-center p-6 rounded-xl border border-success/30 bg-success/5">
            <svg
              className="w-12 h-12 text-success mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-lg font-bold text-success">Check your email</h2>
            <p className="text-sm text-muted mt-2">
              If an account exists with that email, we&apos;ve sent a recovery link.
              Check your inbox (and spam folder).
            </p>
          </div>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
              onKeyDown={(e) => e.key === "Enter" && handleRecover()}
              disabled={loading}
            />

            {error && (
              <p className="text-sm text-danger mt-2">{error}</p>
            )}

            <button
              onClick={handleRecover}
              disabled={loading || !email.trim()}
              className="w-full mt-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Recovery Link"}
            </button>

            <a
              href="/gymdex"
              className="block text-center text-sm text-muted mt-4 hover:text-foreground transition-colors"
            >
              Back to sign up
            </a>
          </>
        )}
      </div>
    </div>
  );
}
