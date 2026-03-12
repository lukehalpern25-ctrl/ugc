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
  creators: {
    id: string;
    legal_name: string;
    email: string | null;
    current_phase: string;
    xp: number;
    level: number;
    current_streak: number;
    tiktok_url: string | null;
    instagram_url: string | null;
    created_at: string;
  }[];
  chart: { date: string; views: number; signups: number }[];
}

interface CreatorDetails {
  profile: {
    id: string;
    legal_name: string;
    email: string | null;
    phone: string | null;
    payment_method: string | null;
    payment_handle: string | null;
    tiktok_username: string | null;
    tiktok_url: string | null;
    instagram_username: string | null;
    instagram_url: string | null;
    current_phase: string;
    warmup_started_at: string | null;
    warmup_day1_completed_at: string | null;
    warmup_day2_completed_at: string | null;
    warmup_day3_completed_at: string | null;
    xp: number;
    level: number;
    current_streak: number;
    longest_streak: number;
    last_post_date: string | null;
    performance_tier: string;
    contract_signed_at: string;
    contract_ip_address: string | null;
    contract_version: string;
    created_at: string;
    updated_at: string;
  };
  progress: { id: string; phase: string; step_id: string; completed_at: string }[];
  warmupTasks: { id: string; day_number: number; task_id: string; completed_at: string }[];
  posts: { id: string; platform: string; post_url: string | null; posted_at: string }[];
  badges: { id: string; badge_id: string; earned_at: string }[];
  earnings: { id: string; month: string; base_amount: number; bonus_amount: number; status: string }[];
  xpEvents: { id: string; amount: number; reason: string; created_at: string }[];
  notifications: { id: string; notification_type: string; sent_at: string }[];
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Creator detail modal state
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [creatorDetails, setCreatorDetails] = useState<CreatorDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const fetchCreatorDetails = useCallback(async (creatorId: string) => {
    setDetailsLoading(true);
    setSelectedCreatorId(creatorId);
    setCreatorDetails(null);
    try {
      const res = await fetch(`/api/gymdex/admin?key=${encodeURIComponent(key)}&creatorId=${creatorId}`);
      if (!res.ok) throw new Error("Failed to fetch creator details");
      const json = await res.json();
      setCreatorDetails(json);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  }, [key]);

  const downloadContract = useCallback(async (creatorId: string) => {
    window.open(`/api/gymdex/admin/contract?key=${encodeURIComponent(key)}&creatorId=${creatorId}`, "_blank");
  }, [key]);

  const deleteCreator = useCallback(async () => {
    if (!selectedCreatorId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/gymdex/admin?key=${encodeURIComponent(key)}&creatorId=${selectedCreatorId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setShowDeleteConfirm(false);
      setSelectedCreatorId(null);
      setCreatorDetails(null);
      fetchData(key);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }, [key, selectedCreatorId, fetchData]);

  const closeModal = useCallback(() => {
    setSelectedCreatorId(null);
    setCreatorDetails(null);
    setShowDeleteConfirm(false);
  }, []);

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

  const { overview, funnel, phaseCounts, phaseCompletions, creators, chart } = data;

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

        {/* All Creators */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-base font-bold text-foreground mb-4">
            All Creators
            <span className="text-sm font-normal text-muted ml-2">({creators.length})</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-border">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Phase</th>
                  <th className="pb-2 font-medium">TikTok</th>
                  <th className="pb-2 font-medium">Instagram</th>
                  <th className="pb-2 font-medium">Level</th>
                  <th className="pb-2 font-medium">XP</th>
                  <th className="pb-2 font-medium">Streak</th>
                  <th className="pb-2 font-medium">Signed</th>
                </tr>
              </thead>
              <tbody>
                {creators.map((creator) => (
                  <tr
                    key={creator.id}
                    className="border-b border-border/50 cursor-pointer hover:bg-surface-light/50 transition-colors"
                    onClick={() => fetchCreatorDetails(creator.id)}
                  >
                    <td className="py-2.5">
                      <p className="font-medium text-foreground">{creator.legal_name}</p>
                      <p className="text-xs text-muted">{creator.email || "—"}</p>
                    </td>
                    <td className="py-2.5">
                      <PhaseTag phase={creator.current_phase} />
                    </td>
                    <td className="py-2.5">
                      {creator.tiktok_url ? (
                        <a
                          href={creator.tiktok_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary-light hover:text-primary text-xs underline underline-offset-2"
                        >
                          {creator.tiktok_url.replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/, "@")}
                        </a>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      {creator.instagram_url ? (
                        <a
                          href={creator.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary-light hover:text-primary text-xs underline underline-offset-2"
                        >
                          {creator.instagram_url.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@")}
                        </a>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
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
                {creators.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-muted">
                      No creators yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Creator Detail Modal */}
      {selectedCreatorId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div
            className="bg-surface rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">
                {detailsLoading ? "Loading..." : creatorDetails?.profile.legal_name || "Creator Details"}
              </h2>
              <button onClick={closeModal} className="text-muted hover:text-foreground text-2xl leading-none">
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {detailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : creatorDetails ? (
                <>
                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => downloadContract(selectedCreatorId)}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                    >
                      Download Contract PDF
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-danger/10 text-danger border border-danger/20 rounded-lg text-sm font-medium hover:bg-danger/20 transition-colors"
                    >
                      Delete Creator
                    </button>
                  </div>

                  {/* Profile Info */}
                  <div className="rounded-xl border border-border bg-surface-light p-4">
                    <h3 className="font-bold text-foreground mb-3">Profile</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <InfoRow label="ID" value={creatorDetails.profile.id} mono />
                      <InfoRow label="Legal Name" value={creatorDetails.profile.legal_name} />
                      <InfoRow label="Email" value={creatorDetails.profile.email} />
                      <InfoRow label="Phone" value={creatorDetails.profile.phone} />
                      <InfoRow label="Current Phase" value={<PhaseTag phase={creatorDetails.profile.current_phase} />} />
                      <InfoRow label="Performance Tier" value={creatorDetails.profile.performance_tier} />
                      <InfoRow label="Level" value={`Lv.${creatorDetails.profile.level}`} />
                      <InfoRow label="XP" value={creatorDetails.profile.xp} />
                      <InfoRow label="Current Streak" value={`${creatorDetails.profile.current_streak} days`} />
                      <InfoRow label="Longest Streak" value={`${creatorDetails.profile.longest_streak} days`} />
                      <InfoRow label="Last Post" value={creatorDetails.profile.last_post_date} />
                    </div>
                  </div>

                  {/* Social Accounts */}
                  <div className="rounded-xl border border-border bg-surface-light p-4">
                    <h3 className="font-bold text-foreground mb-3">Social Accounts</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <InfoRow label="TikTok Username" value={creatorDetails.profile.tiktok_username} />
                      <InfoRow
                        label="TikTok URL"
                        value={creatorDetails.profile.tiktok_url ? (
                          <a href={creatorDetails.profile.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-primary-light hover:text-primary underline">
                            {creatorDetails.profile.tiktok_url}
                          </a>
                        ) : null}
                      />
                      <InfoRow label="Instagram Username" value={creatorDetails.profile.instagram_username} />
                      <InfoRow
                        label="Instagram URL"
                        value={creatorDetails.profile.instagram_url ? (
                          <a href={creatorDetails.profile.instagram_url} target="_blank" rel="noopener noreferrer" className="text-primary-light hover:text-primary underline">
                            {creatorDetails.profile.instagram_url}
                          </a>
                        ) : null}
                      />
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="rounded-xl border border-border bg-surface-light p-4">
                    <h3 className="font-bold text-foreground mb-3">Payment</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <InfoRow label="Payment Method" value={creatorDetails.profile.payment_method} />
                      <InfoRow label="Payment Handle" value={creatorDetails.profile.payment_handle} />
                    </div>
                  </div>

                  {/* Contract Info */}
                  <div className="rounded-xl border border-border bg-surface-light p-4">
                    <h3 className="font-bold text-foreground mb-3">Contract</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <InfoRow label="Signed At" value={new Date(creatorDetails.profile.contract_signed_at).toLocaleString()} />
                      <InfoRow label="Contract Version" value={creatorDetails.profile.contract_version} />
                      <InfoRow label="IP Address" value={creatorDetails.profile.contract_ip_address} mono />
                    </div>
                  </div>

                  {/* Warmup Progress */}
                  <div className="rounded-xl border border-border bg-surface-light p-4">
                    <h3 className="font-bold text-foreground mb-3">Warmup Progress</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <InfoRow label="Started At" value={creatorDetails.profile.warmup_started_at ? new Date(creatorDetails.profile.warmup_started_at).toLocaleString() : null} />
                      <InfoRow label="Day 1 Completed" value={creatorDetails.profile.warmup_day1_completed_at ? new Date(creatorDetails.profile.warmup_day1_completed_at).toLocaleString() : null} />
                      <InfoRow label="Day 2 Completed" value={creatorDetails.profile.warmup_day2_completed_at ? new Date(creatorDetails.profile.warmup_day2_completed_at).toLocaleString() : null} />
                      <InfoRow label="Day 3 Completed" value={creatorDetails.profile.warmup_day3_completed_at ? new Date(creatorDetails.profile.warmup_day3_completed_at).toLocaleString() : null} />
                    </div>
                  </div>

                  {/* Posts */}
                  {creatorDetails.posts.length > 0 && (
                    <div className="rounded-xl border border-border bg-surface-light p-4">
                      <h3 className="font-bold text-foreground mb-3">Posts ({creatorDetails.posts.length})</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {creatorDetails.posts.map((post) => (
                          <div key={post.id} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                            <span className="text-muted capitalize">{post.platform}</span>
                            <span className="text-muted">{new Date(post.posted_at).toLocaleDateString()}</span>
                            {post.post_url && (
                              <a href={post.post_url} target="_blank" rel="noopener noreferrer" className="text-primary-light hover:text-primary text-xs underline">
                                View
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  {creatorDetails.badges.length > 0 && (
                    <div className="rounded-xl border border-border bg-surface-light p-4">
                      <h3 className="font-bold text-foreground mb-3">Badges ({creatorDetails.badges.length})</h3>
                      <div className="flex flex-wrap gap-2">
                        {creatorDetails.badges.map((badge) => (
                          <span key={badge.id} className="px-2 py-1 bg-primary/10 text-primary-light text-xs rounded-full">
                            {badge.badge_id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent XP Events */}
                  {creatorDetails.xpEvents.length > 0 && (
                    <div className="rounded-xl border border-border bg-surface-light p-4">
                      <h3 className="font-bold text-foreground mb-3">Recent XP Events</h3>
                      <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
                        {creatorDetails.xpEvents.slice(0, 10).map((event) => (
                          <div key={event.id} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                            <span className="text-foreground">+{event.amount} XP</span>
                            <span className="text-muted">{event.reason}</span>
                            <span className="text-muted">{new Date(event.created_at).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="rounded-xl border border-border bg-surface-light p-4">
                    <h3 className="font-bold text-foreground mb-3">Timestamps</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <InfoRow label="Created At" value={new Date(creatorDetails.profile.created_at).toLocaleString()} />
                      <InfoRow label="Updated At" value={new Date(creatorDetails.profile.updated_at).toLocaleString()} />
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted py-8">Failed to load creator details</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Creator?</h3>
            <p className="text-sm text-muted mb-4">
              This will permanently delete <strong>{creatorDetails?.profile.legal_name}</strong> and all their data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 border border-border rounded-lg text-foreground hover:bg-surface-light transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={deleteCreator}
                disabled={deleting}
                className="flex-1 py-2 bg-danger text-white rounded-lg font-medium hover:bg-danger/90 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-muted text-xs mb-0.5">{label}</p>
      <p className={`text-foreground ${mono ? "font-mono text-xs" : ""}`}>
        {value ?? <span className="text-muted">—</span>}
      </p>
    </div>
  );
}

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
