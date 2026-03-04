// ─── Database Row Types ──────────────────────────────────────────────

export type Phase = 'setup' | 'warmup' | 'posting' | 'active';
export type PaymentMethod = 'paypal' | 'venmo' | 'sideshift';
export type Platform = 'tiktok' | 'instagram';
export type PerformanceTier = 'standard' | 'rising' | 'top_performer' | 'elite';
export type EarningsStatus = 'pending' | 'paid';

export interface CreatorProfile {
  id: string;
  legal_name: string;
  contract_signed_at: string;
  contract_ip_address: string | null;
  contract_user_agent: string | null;
  contract_version: string;

  email: string | null;
  phone: string | null;
  payment_method: PaymentMethod | null;
  payment_handle: string | null;

  tiktok_username: string | null;
  tiktok_url: string | null;
  instagram_username: string | null;
  instagram_url: string | null;

  current_phase: Phase;

  warmup_started_at: string | null;
  warmup_day1_completed_at: string | null;
  warmup_day2_completed_at: string | null;
  warmup_day3_completed_at: string | null;

  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_post_date: string | null;

  performance_tier: PerformanceTier;

  created_at: string;
  updated_at: string;
}

export interface CreatorProgress {
  id: string;
  creator_id: string;
  phase: string;
  step_id: string;
  completed_at: string;
}

export interface WarmupDailyTask {
  id: string;
  creator_id: string;
  day_number: number;
  task_id: string;
  completed_at: string;
}

export interface CreatorPost {
  id: string;
  creator_id: string;
  platform: Platform;
  post_url: string | null;
  posted_at: string;
  created_at: string;
}

export interface XPEvent {
  id: string;
  creator_id: string;
  amount: number;
  reason: string;
  source_type: string | null;
  source_id: string | null;
  created_at: string;
}

export interface CreatorBadge {
  id: string;
  creator_id: string;
  badge_id: string;
  earned_at: string;
}

export interface CreatorEarnings {
  id: string;
  creator_id: string;
  month: string;
  base_amount: number;
  bonus_amount: number;
  status: EarningsStatus;
}

export interface NotificationSent {
  id: string;
  creator_id: string;
  notification_type: string;
  sent_at: string;
  metadata: Record<string, unknown> | null;
}

// ─── API Response Types ──────────────────────────────────────────────

export interface DashboardData {
  profile: CreatorProfile;
  progress: CreatorProgress[];
  warmupTasks: WarmupDailyTask[];
  posts: CreatorPost[];
  badges: CreatorBadge[];
  earnings: CreatorEarnings[];
  recentXP: XPEvent[];
}

export interface ContractSignRequest {
  legal_name: string;
}

export interface ContractSignResponse {
  id: string;
}

export interface ProgressUpdateRequest {
  phase: string;
  step_id: string;
}

export interface WarmupTaskRequest {
  day_number: number;
  task_id: string;
}

export interface AccountsUpdateRequest {
  tiktok_url?: string;
  tiktok_username?: string;
  instagram_url?: string;
  instagram_username?: string;
}

export interface ProfileUpdateRequest {
  email?: string;
  phone?: string;
  payment_method?: PaymentMethod;
  payment_handle?: string;
}

export interface PostLogRequest {
  platform: Platform;
  post_url?: string;
  posted_at?: string;
}
