"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PitchSection from "@/components/gymdex/PitchSection";
import ContractForm from "@/components/gymdex/ContractForm";
import { useAnalytics } from "@/lib/hooks/useAnalytics";

export default function GymdexPage() {
  const router = useRouter();
  const { trackPageView } = useAnalytics();

  // Track page view
  useEffect(() => {
    trackPageView("/gymdex");
  }, [trackPageView]);

  // If already signed, redirect to dashboard
  useEffect(() => {
    const id = localStorage.getItem("gymdex-creator-id");
    if (id) {
      router.replace("/gymdex/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface/50 border-b border-border relative">
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
        <Link
          href="/gymdex/signin"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white hover:text-white/80 font-medium transition-colors"
        >
          Sign Back In
        </Link>
      </div>

      <main className="max-w-lg mx-auto px-4 pb-16">
        <PitchSection />

        {/* Contract Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-center text-foreground mb-6">
            Ready to start?
          </h2>
          <ContractForm />
          <p className="text-center mt-4 text-sm text-muted">
            Already signed up?{" "}
            <Link href="/gymdex/signin" className="text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
