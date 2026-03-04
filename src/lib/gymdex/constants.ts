// ─── XP Rewards ──────────────────────────────────────────────────────

export const XP_REWARDS = {
  // Setup phase
  SETUP_STEP: 25,

  // Warm-up phase
  WARMUP_TASK: 15,
  WARMUP_DAY_BONUS: 50,

  // Posting guide phase
  POSTING_STEP: 20,

  // Phase completions
  PHASE_SETUP: 200,
  PHASE_WARMUP: 300,
  PHASE_POSTING: 500,

  // Active phase
  POST_LOGGED: 50,
  DAILY_QUOTA_BONUS: 100,

  // Streak bonuses
  STREAK_3: 75,
  STREAK_7: 200,
  STREAK_14: 500,
  STREAK_30: 1500,
} as const;

// ─── Levels ──────────────────────────────────────────────────────────

export interface LevelDef {
  level: number;
  name: string;
  xpRequired: number;
}

export const LEVELS: LevelDef[] = [
  { level: 1, name: "Newcomer", xpRequired: 0 },
  { level: 2, name: "Getting Started", xpRequired: 100 },
  { level: 3, name: "Learner", xpRequired: 300 },
  { level: 4, name: "Apprentice", xpRequired: 600 },
  { level: 5, name: "Creator", xpRequired: 1000 },
  { level: 6, name: "Rising Star", xpRequired: 1500 },
  { level: 7, name: "Pro Creator", xpRequired: 2500 },
  { level: 8, name: "Expert", xpRequired: 4000 },
  { level: 9, name: "Master", xpRequired: 6000 },
  { level: 10, name: "Legend", xpRequired: 10000 },
];

export function getLevelForXP(xp: number): LevelDef {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getXPProgress(xp: number): { current: number; next: number; progress: number } {
  const currentLevel = getLevelForXP(xp);
  const nextLevelIndex = LEVELS.findIndex((l) => l.level === currentLevel.level + 1);
  if (nextLevelIndex === -1) {
    return { current: xp, next: xp, progress: 100 };
  }
  const nextLevel = LEVELS[nextLevelIndex];
  const xpIntoLevel = xp - currentLevel.xpRequired;
  const xpNeeded = nextLevel.xpRequired - currentLevel.xpRequired;
  return {
    current: xpIntoLevel,
    next: xpNeeded,
    progress: Math.round((xpIntoLevel / xpNeeded) * 100),
  };
}

// ─── Badges ──────────────────────────────────────────────────────────

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'onboarding' | 'posting' | 'streaks' | 'special';
}

export const BADGES: BadgeDef[] = [
  // Onboarding
  { id: "signed_up", name: "Signed Up", description: "Signed the creator contract", icon: "pen-line", category: "onboarding" },
  { id: "all_set_up", name: "All Set Up", description: "Completed account setup", icon: "zap", category: "onboarding" },
  { id: "warmed_up", name: "Warmed Up", description: "Completed the 3-day warm-up", icon: "flame", category: "onboarding" },
  { id: "fully_trained", name: "Fully Trained", description: "Completed the posting guide", icon: "graduation-cap", category: "onboarding" },

  // Posting
  { id: "first_post", name: "First Post", description: "Logged your first post", icon: "clapperboard", category: "posting" },
  { id: "getting_going", name: "Getting Going", description: "Logged 10 posts", icon: "rocket", category: "posting" },
  { id: "prolific", name: "Prolific", description: "Logged 50 posts", icon: "camera", category: "posting" },
  { id: "centurion", name: "Centurion", description: "Logged 100 posts", icon: "award", category: "posting" },
  { id: "full_day", name: "Full Day", description: "Hit daily posting quota", icon: "calendar-check", category: "posting" },

  // Streaks
  { id: "on_a_roll", name: "On a Roll", description: "3-day posting streak", icon: "target", category: "streaks" },
  { id: "week_warrior", name: "Week Warrior", description: "7-day posting streak", icon: "swords", category: "streaks" },
  { id: "unstoppable", name: "Unstoppable", description: "14-day posting streak", icon: "dumbbell", category: "streaks" },
  { id: "iron_will", name: "Iron Will", description: "30-day posting streak", icon: "trophy", category: "streaks" },

  // Special
  { id: "creator_status", name: "Creator Status", description: "Reached Level 5", icon: "star", category: "special" },
  { id: "legendary", name: "Legendary", description: "Reached Level 10", icon: "crown", category: "special" },
];

export function getBadge(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}

// ─── Performance Tiers ───────────────────────────────────────────────

export interface TierDef {
  id: string;
  name: string;
  monthlyPay: number;
  requirement: string;
  color: string;
}

export const TIERS: TierDef[] = [
  { id: "standard", name: "Standard", monthlyPay: 250, requirement: "Default tier", color: "#9ca3af" },
  { id: "rising", name: "Rising", monthlyPay: 300, requirement: "90%+ daily quota for 4 weeks", color: "#22c55e" },
  { id: "top_performer", name: "Top Performer", monthlyPay: 400, requirement: "30-day streak + engagement", color: "#8b5cf6" },
  { id: "elite", name: "Elite", monthlyPay: 500, requirement: "30-day streak + top metrics", color: "#fbbf24" },
];

export function getTier(id: string): TierDef | undefined {
  return TIERS.find((t) => t.id === id);
}

// ─── Warm-up Config ──────────────────────────────────────────────────

export const WARMUP_DAYS = 3;
export const WARMUP_UNLOCK_HOURS = 24; // hours between days
export const DAILY_POST_QUOTA = 4;

// ─── Streak Milestones ───────────────────────────────────────────────

export const STREAK_MILESTONES = [
  { days: 3, xp: XP_REWARDS.STREAK_3, badge: "on_a_roll" },
  { days: 7, xp: XP_REWARDS.STREAK_7, badge: "week_warrior" },
  { days: 14, xp: XP_REWARDS.STREAK_14, badge: "unstoppable" },
  { days: 30, xp: XP_REWARDS.STREAK_30, badge: "iron_will" },
] as const;

// ─── Post Count Milestones ───────────────────────────────────────────

export const POST_MILESTONES = [
  { count: 1, badge: "first_post" },
  { count: 10, badge: "getting_going" },
  { count: 50, badge: "prolific" },
  { count: 100, badge: "centurion" },
] as const;
