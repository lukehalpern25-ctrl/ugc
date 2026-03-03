"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PitchSection from "@/components/gymdex/PitchSection";
import ContractForm from "@/components/gymdex/ContractForm";

export default function GymdexPage() {
  const router = useRouter();

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

      <main className="max-w-lg mx-auto px-4 pb-16">
        <PitchSection />

        {/* Contract Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-center text-foreground mb-2">
            Ready to Start?
          </h2>
          <p className="text-center text-sm text-muted mb-6">
            Read the agreement below and sign to get started
          </p>
          <ContractForm />
        </section>
      </main>
    </div>
  );
}
