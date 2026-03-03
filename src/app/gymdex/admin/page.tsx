"use client";

import { useState, useEffect, useCallback } from "react";

interface AdminData {
  overview: {
    totalCreators: number;
    pitchViewsTotal: number;
    pitchViews7d: number;
    contractSignsTotal: number;
    contractSigns7d: number;
    conversionRate: number;
    uniqueVisitorsTotal: number;
    uniqueVisitors7d: number;
  };
  funnel: {
    pitchViews: number;
    contractSigned: number;
    setup: number;
    warmup: number;
    posting: number;
    active: number;
  };
  phaseCounts: Record<string, number>;
  phaseCompletions: Record<string, number>;
  recentCreators: {
    id: string;
    legal_name: string;
    email: string | null;
    current_phase: string;
    xp: number;
    level: number;
    current_streak: number;
    created_at: string;
  }[];
  chart: { date: string; views: number; signups: number }[];
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async (adminKey: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/gymdex/admin?key=${encodeURIComponent(adminKey)}`);
      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid key");
        throw new Error("Failed to fetch");
      }
      const json = await res.json();
      setData(json);
      setAuthed(true);
      localStorage.setItem("gymdex-admin-key", adminKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-login from saved key
  useEffect(() => {
    const saved = localStorage.getItem("gymdex-admin-key");
    if (saved) {
      setKey(saved);
      fetchData(saved);
    }
  }, [fetchData]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <h1 className="text-2xl font-bold text-foreground text-center mb-6">Admin</h1>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Admin key"
            className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary"
            onKeyDown={(e) => e.key === "Enter" && fetchData(key)}
          />
          {error && <p className="text-sm text-danger mt-2">{error}</p>}
          <button
            onClick={() => fetchData(key)}
            disabled={loading || !key}
            className="w-full mt-4 py-3 bg-primary text-white font-bold rounded-xl disabled:opacity-50"
          >
            {loading ? "Loading..." : "Access Dashboard"}
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overview, funnel, phaseCounts, phaseCompletions, recentCreators, chart } = data;

  // Funnel steps
  const funnelSteps = [
    { label: "Pitch Page Views", count: funnel.pitchViews, color: "bg-blue-500" },
    { label: "Contract Signed", count: funnel.contractSigned, color: "bg-purple-500" },
    { label: "In Setup", count: phaseCounts.setup, color: "bg-yellow-500" },
    { label: "In Warm-up", count: phaseCounts.warmup, color: "bg-orange-500" },
    { label: "In Posting Guide", count: phaseCounts.posting, color: "bg-pink-500" },
    { label: "Active (Posting)", count: phaseCounts.active, color: "bg-green-500" },
  ];

  const maxFunnel = Math.max(...funnelSteps.map((s) => s.count), 1);

  // Chart max
  const chartMax = Math.max(...chart.map((d) => Math.max(d.views, d.signups)), 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface/50 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">Gymdex Admin</h1>
          <button
            onClick={() => fetchData(key)}
            className="text-sm text-primary-light hover:text-primary font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Creators" value={overview.totalCreators} />
          <StatCard label="Unique Visitors" value={overview.uniqueVisitorsTotal} sub={`${overview.uniqueVisitors7d} this week`} />
          <StatCard label="Pitch Views" value={overview.pitchViewsTotal} sub={`${overview.pitchViews7d} this week`} />
          <StatCard label="Conversion Rate" value={`${overview.conversionRate}%`} sub={`${overview.contractSignsTotal} signed`} />
        </div>

        {/* Funnel */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-base font-bold text-foreground mb-4">Conversion Funnel</h2>
          <div className="space-y-3">
            {funnelSteps.map((step) => {
              const width = Math.max((step.count / maxFunnel) * 100, 2);
              const dropoff =
                step.count > 0 && funnelSteps[0].count > 0
                  ? ((step.count / funnelSteps[0].count) * 100).toFixed(0)
                  : "0";

              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{step.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{step.count}</span>
                      <span className="text-xs text-muted">({dropoff}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-6 bg-surface-light rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${step.color} rounded-lg transition-all duration-500`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase Completions */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-base font-bold text-foreground mb-4">Phase Completions</h2>
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Setup Completed" value={phaseCompletions.setup || 0} />
            <MiniStat label="Warmup Completed" value={phaseCompletions.warmup || 0} />
            <MiniStat label="Posting Completed" value={phaseCompletions.posting || 0} />
          </div>
        </div>

        {/* 30-Day Chart */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-base font-bold text-foreground mb-4">Last 30 Days</h2>
          <div className="flex items-center gap-4 mb-3 text-xs text-muted">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span>Page Views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Signups</span>
            </div>
          </div>
          <div className="flex items-end gap-[2px] h-32">
            {chart.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center justify-end gap-[1px] h-full" title={`${day.date}: ${day.views} views, ${day.signups} signups`}>
                <div
                  className="w-full bg-blue-500/60 rounded-t-sm min-h-[1px]"
                  style={{ height: `${(day.views / chartMax) * 100}%` }}
                />
                <div
                  className="w-full bg-green-500/80 rounded-t-sm"
                  style={{ height: day.signups > 0 ? `${Math.max((day.signups / chartMax) * 100, 3)}%` : "0%" }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted">
            <span>{chart[0]?.date.slice(5)}</span>
            <span>{chart[Math.floor(chart.length / 2)]?.date.slice(5)}</span>
            <span>{chart[chart.length - 1]?.date.slice(5)}</span>
          </div>
        </div>

        {/* Recent Creators */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-base font-bold text-foreground mb-4">Recent Creators</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-border">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Phase</th>
                  <th className="pb-2 font-medium">Level</th>
                  <th className="pb-2 font-medium">XP</th>
                  <th className="pb-2 font-medium">Streak</th>
                  <th className="pb-2 font-medium">Signed</th>
                </tr>
              </thead>
              <tbody>
                {recentCreators.map((creator) => (
                  <tr key={creator.id} className="border-b border-border/50">
                    <td className="py-2.5 font-medium text-foreground">{creator.legal_name}</td>
                    <td className="py-2.5 text-muted">{creator.email || "—"}</td>
                    <td className="py-2.5">
                      <PhaseTag phase={creator.current_phase} />
                    </td>
                    <td className="py-2.5 text-muted">Lv.{creator.level}</td>
                    <td className="py-2.5 text-muted">{creator.xp}</td>
                    <td className="py-2.5 text-muted">
                      {creator.current_streak > 0 ? `${creator.current_streak}d` : "—"}
                    </td>
                    <td className="py-2.5 text-muted text-xs">
                      {new Date(creator.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentCreators.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted">
                      No creators yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-[10px] text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-3 rounded-lg bg-surface-light">
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted mt-0.5">{label}</p>
    </div>
  );
}

function PhaseTag({ phase }: { phase: string }) {
  const styles: Record<string, string> = {
    setup: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    warmup: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    posting: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    active: "bg-green-500/10 text-green-400 border-green-500/20",
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${styles[phase] || "bg-surface-light text-muted border-border"}`}>
      {phase}
    </span>
  );
}
