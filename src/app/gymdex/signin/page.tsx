"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/gymdex/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      // Store creator ID and redirect to dashboard
      localStorage.setItem("gymdex-creator-id", data.id);
      router.push("/gymdex/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
          <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
          <p className="text-sm text-muted mt-2">
            Enter your email and password to access your dashboard.
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
            disabled={loading}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
            disabled={loading}
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            onClick={handleSignIn}
            disabled={loading || !email.trim() || !password}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm">
          <Link
            href="/gymdex"
            className="text-muted hover:text-foreground transition-colors"
          >
            Back to sign up
          </Link>
          <Link
            href="/gymdex/recover"
            className="text-primary-light hover:text-primary transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
