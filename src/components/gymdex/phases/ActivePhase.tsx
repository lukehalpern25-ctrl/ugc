"use client";

import { useState, useCallback } from "react";
import type { CreatorProfile, CreatorPost, CreatorEarnings, Platform } from "@/lib/gymdex/types";
import ResourcesTab from "@/components/ResourcesTab";

interface ActivePhaseProps {
  creatorId: string;
  profile: CreatorProfile;
  posts: CreatorPost[];
  earnings: CreatorEarnings[];
  onRefetch: () => void;
}

export default function ActivePhase({
  creatorId,
  profile,
  posts,
  onRefetch,
}: ActivePhaseProps) {
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [postUrl, setPostUrl] = useState("");
  const [logging, setLogging] = useState(false);
  const [logResult, setLogResult] = useState<string | null>(null);
  const [showResources, setShowResources] = useState(false);

  const handleLogPost = useCallback(async () => {
    setLogging(true);
    setLogResult(null);

    try {
      const res = await fetch(`/api/gymdex/creator/${creatorId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          post_url: postUrl.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to log post");

      const data = await res.json();
      setPostUrl("");
      setLogResult(
        `+${data.xp?.newXP ? "50" : "0"} XP${
          data.streak?.streak > 1 ? ` | ${data.streak.streak}-day streak!` : ""
        }${data.quotaMet ? " | Daily quota met! +100 XP" : ""}${
          data.newBadges?.length ? ` | New badge: ${data.newBadges.join(", ")}` : ""
        }`
      );

      setTimeout(() => setLogResult(null), 5000);
      onRefetch();
    } catch {
      setLogResult("Failed to log post. Try again.");
    } finally {
      setLogging(false);
    }
  }, [creatorId, platform, postUrl, onRefetch]);

  // Build calendar data (last 30 days)
  const calendarDays = buildCalendar(posts);
  const todayPosts = posts.filter(
    (p) => p.posted_at === new Date().toISOString().split("T")[0]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Active Dashboard</h2>
        <p className="text-sm text-muted">
          Log your posts, track your progress, and earn rewards
        </p>
      </div>

      {/* Log Post Form */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Log a Post</h3>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setPlatform("tiktok")}
            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
              platform === "tiktok"
                ? "border-primary bg-primary/10 text-primary-light"
                : "border-border bg-surface-light text-muted"
            }`}
          >
            TikTok
          </button>
          <button
            onClick={() => setPlatform("instagram")}
            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
              platform === "instagram"
                ? "border-primary bg-primary/10 text-primary-light"
                : "border-border bg-surface-light text-muted"
            }`}
          >
            Instagram
          </button>
        </div>

        <input
          type="url"
          value={postUrl}
          onChange={(e) => setPostUrl(e.target.value)}
          placeholder="Post URL (optional)"
          className="w-full px-3 py-2 rounded-lg bg-surface-light border border-border text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary mb-3"
        />

        <button
          onClick={handleLogPost}
          disabled={logging}
          className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {logging ? "Logging..." : "Log Post"}
        </button>

        {logResult && (
          <div className="mt-3 px-3 py-2 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-xs text-success font-medium">{logResult}</p>
          </div>
        )}
      </div>

      {/* Today's Progress */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-foreground">Today</h3>
          <span className="text-xs text-muted">
            {todayPosts.length}/4 posts
          </span>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full ${
                i < todayPosts.length ? "bg-success" : "bg-surface-light"
              }`}
            />
          ))}
        </div>
        {todayPosts.length >= 4 && (
          <p className="text-xs text-success mt-2 font-medium">
            Daily quota met! +100 XP bonus
          </p>
        )}
      </div>

      {/* Posting Calendar */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Posting Calendar</h3>
        <div className="grid grid-cols-7 gap-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} className="text-center text-[10px] text-muted font-medium pb-1">
              {d}
            </div>
          ))}
          {calendarDays.map((day, i) => (
            <div
              key={i}
              className={`aspect-square rounded-md flex items-center justify-center text-[10px] ${
                day.count > 0
                  ? day.count >= 4
                    ? "bg-success/30 text-success font-bold"
                    : "bg-primary/20 text-primary-light"
                  : day.isToday
                  ? "bg-surface-light border border-primary/30 text-foreground"
                  : day.inMonth
                  ? "bg-surface-light text-muted/50"
                  : ""
              }`}
              title={day.date ? `${day.date}: ${day.count} posts` : ""}
            >
              {day.dayNum || ""}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-muted">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary/20" />
            <span>Posted</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-success/30" />
            <span>Quota met</span>
          </div>
        </div>
      </div>

      {/* Quick Reminders */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <h3 className="text-sm font-bold text-primary-light mb-2">Quick Reminders</h3>
        <ul className="space-y-1.5 text-xs text-muted">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">&bull;</span>
            Film on Snapchat in ONE continuous video
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">&bull;</span>
            Never mention &quot;app&quot; or &quot;Gymdex&quot; in captions
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">&bull;</span>
            Reply to EVERY comment for reach
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">&bull;</span>
            Post 4 videos/day to hit your quota
          </li>
        </ul>
      </div>

      {/* Resources toggle */}
      <button
        onClick={() => setShowResources(!showResources)}
        className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-surface"
      >
        <span className="font-semibold text-foreground text-sm">Resources & Examples</span>
        <svg
          className={`w-5 h-5 text-muted transition-transform ${showResources ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {showResources && <ResourcesTab />}
    </div>
  );
}

// ─── Calendar Helpers ────────────────────────────────────────────────

interface CalendarDay {
  date: string | null;
  dayNum: number | null;
  count: number;
  isToday: boolean;
  inMonth: boolean;
}

function buildCalendar(posts: CreatorPost[]): CalendarDay[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.toISOString().split("T")[0];

  // Count posts per day
  const postCounts: Record<string, number> = {};
  for (const post of posts) {
    postCounts[post.posted_at] = (postCounts[post.posted_at] || 0) + 1;
  }

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Start from Monday
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const days: CalendarDay[] = [];

  // Padding before
  for (let i = 0; i < startOffset; i++) {
    days.push({ date: null, dayNum: null, count: 0, isToday: false, inMonth: false });
  }

  // Days of month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({
      date: dateStr,
      dayNum: d,
      count: postCounts[dateStr] || 0,
      isToday: dateStr === today,
      inMonth: true,
    });
  }

  // Padding after to fill last row
  while (days.length % 7 !== 0) {
    days.push({ date: null, dayNum: null, count: 0, isToday: false, inMonth: false });
  }

  return days;
}
