"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreator } from "@/lib/hooks/useCreator";
import DashboardHeader from "@/components/gymdex/DashboardHeader";
import PhaseProgress from "@/components/gymdex/PhaseProgress";
import XPBar from "@/components/gymdex/XPBar";
import StreakCounter from "@/components/gymdex/StreakCounter";
import BadgeGrid from "@/components/gymdex/BadgeGrid";
import EarningsCard from "@/components/gymdex/EarningsCard";
import PerformanceTier from "@/components/gymdex/PerformanceTier";
import ConfettiOverlay from "@/components/gymdex/ConfettiOverlay";
import SetupPhase from "@/components/gymdex/phases/SetupPhase";
import WarmupPhase from "@/components/gymdex/phases/WarmupPhase";
import PostingPhase from "@/components/gymdex/phases/PostingPhase";
import ActivePhase from "@/components/gymdex/phases/ActivePhase";

export default function DashboardPage() {
  const router = useRouter();
  const { creatorId, data, loading, error, refetch } = useCreator();
  const [showConfetti, setShowConfetti] = useState(false);

  // Redirect if no session
  useEffect(() => {
    if (!loading && !creatorId) {
      router.replace("/gymdex");
    }
  }, [loading, creatorId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground mb-2">Something went wrong</p>
          <p className="text-sm text-muted mb-4">{error || "Could not load dashboard"}</p>
          <button
            onClick={() => router.replace("/gymdex")}
            className="px-6 py-2 bg-primary text-white font-semibold rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { profile, progress, warmupTasks, posts, badges, earnings } = data;

  const handlePhaseComplete = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
    refetch();
  };

  const renderPhase = () => {
    switch (profile.current_phase) {
      case "setup":
        return (
          <SetupPhase
            creatorId={profile.id}
            profile={profile}
            progress={progress}
            onComplete={handlePhaseComplete}
            onRefetch={refetch}
          />
        );
      case "warmup":
        return (
          <WarmupPhase
            creatorId={profile.id}
            profile={profile}
            warmupTasks={warmupTasks}
            onComplete={handlePhaseComplete}
            onRefetch={refetch}
          />
        );
      case "posting":
        return (
          <PostingPhase
            creatorId={profile.id}
            progress={progress}
            onComplete={handlePhaseComplete}
            onRefetch={refetch}
          />
        );
      case "active":
        return (
          <ActivePhase
            creatorId={profile.id}
            profile={profile}
            posts={posts}
            earnings={earnings}
            onRefetch={refetch}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {showConfetti && <ConfettiOverlay />}

      <DashboardHeader
        name={profile.legal_name}
        xp={profile.xp}
        streak={profile.current_streak}
      />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Phase Progress Stepper */}
        <div className="mb-6">
          <PhaseProgress currentPhase={profile.current_phase} />
        </div>

        {/* Main Layout: Content + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {renderPhase()}
          </div>

          {/* Gamification Sidebar */}
          <div className="w-full lg:w-80 space-y-4">
            <XPBar xp={profile.xp} />
            <StreakCounter
              currentStreak={profile.current_streak}
              longestStreak={profile.longest_streak}
            />
            <EarningsCard
              tier={profile.performance_tier}
              earnings={earnings}
            />
            <PerformanceTier tier={profile.performance_tier} />
            <BadgeGrid earnedBadges={badges.map((b) => b.badge_id)} />
          </div>
        </div>
      </div>
    </div>
  );
}
