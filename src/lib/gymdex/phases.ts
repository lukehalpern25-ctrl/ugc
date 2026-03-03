// ─── Phase & Step Content Definitions ────────────────────────────────

export interface PhaseStep {
  id: string;
  title: string;
  description: string;
  type: 'input' | 'select' | 'url' | 'checkbox' | 'info';
  field?: string; // maps to profile field for inputs
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  details?: string[];
}

export interface PhaseDef {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  steps: PhaseStep[];
}

// ─── Phase 1: Account Setup ─────────────────────────────────────────

export const setupPhase: PhaseDef = {
  id: "setup",
  title: "Account Setup",
  subtitle: "Set up your creator accounts and payment info",
  icon: "⚙️",
  steps: [
    {
      id: "setup-email",
      title: "Email Address",
      description: "We'll use this to send you updates and payment info.",
      type: "input",
      field: "email",
      required: true,
      placeholder: "you@example.com",
    },
    {
      id: "setup-phone",
      title: "Phone Number (optional)",
      description: "So we can reach you if needed.",
      type: "input",
      field: "phone",
      placeholder: "(555) 555-5555",
    },
    {
      id: "setup-payment",
      title: "Payment Method",
      description: "How would you like to get paid?",
      type: "select",
      field: "payment_method",
      required: true,
      options: [
        { value: "paypal", label: "PayPal" },
        { value: "sideshift", label: "Sideshift (crypto)" },
      ],
    },
    {
      id: "setup-payment-handle",
      title: "Payment Handle",
      description: "Your PayPal email or Sideshift address.",
      type: "input",
      field: "payment_handle",
      required: true,
      placeholder: "paypal@example.com",
    },
    {
      id: "setup-tiktok",
      title: "Create a TikTok Account",
      description: "Create a new TikTok account for posting Gymdex content. Use a fitness-related username. Submit the profile URL below.",
      type: "url",
      field: "tiktok_url",
      required: true,
      placeholder: "https://tiktok.com/@yourusername",
    },
    {
      id: "setup-instagram",
      title: "Create an Instagram Account",
      description: "Create a new Instagram account (Reels). Use a matching username. Submit the profile URL below.",
      type: "url",
      field: "instagram_url",
      required: true,
      placeholder: "https://instagram.com/yourusername",
    },
    {
      id: "setup-bio-check",
      title: "Confirm Bio & Username",
      description: "Make sure your accounts look organic:",
      type: "checkbox",
      details: [
        "Username looks like a real person (not branded)",
        "Bio mentions fitness/gym/workout naturally",
        "Profile pic is a real photo (not a logo)",
        "No mention of Gymdex anywhere on profile",
      ],
    },
  ],
};

// ─── Phase 2: Warm-up Tasks ─────────────────────────────────────────

export interface WarmupTaskDef {
  id: string;
  title: string;
  description: string;
}

export interface WarmupDayDef {
  day: number;
  title: string;
  subtitle: string;
  tasks: WarmupTaskDef[];
}

export const warmupDays: WarmupDayDef[] = [
  {
    day: 1,
    title: "Day 1",
    subtitle: "Start building your account's credibility",
    tasks: [
      {
        id: "d1-scroll",
        title: "Scroll TikTok for 15-30 minutes",
        description: "Browse fitness content on your For You Page. Like and engage naturally.",
      },
      {
        id: "d1-comment",
        title: "Comment on 5 fitness posts",
        description: "Leave genuine comments on fitness/gym videos. Be authentic.",
      },
      {
        id: "d1-follow",
        title: "Follow 10 fitness accounts",
        description: "Follow popular fitness creators and gym accounts.",
      },
    ],
  },
  {
    day: 2,
    title: "Day 2",
    subtitle: "Continue warming up your algorithm",
    tasks: [
      {
        id: "d2-scroll",
        title: "Scroll TikTok for 15-30 minutes",
        description: "Keep engaging with fitness content to train the algorithm.",
      },
      {
        id: "d2-comment",
        title: "Comment on 5 fitness posts",
        description: "More genuine comments on different videos.",
      },
      {
        id: "d2-follow",
        title: "Follow 10 more fitness accounts",
        description: "Expand your fitness network.",
      },
    ],
  },
  {
    day: 3,
    title: "Day 3",
    subtitle: "Final warm-up day — almost there!",
    tasks: [
      {
        id: "d3-scroll",
        title: "Scroll TikTok for 15-30 minutes",
        description: "Final day of algorithm training.",
      },
      {
        id: "d3-comment",
        title: "Comment on 5 fitness posts",
        description: "Keep the engagement going.",
      },
      {
        id: "d3-follow",
        title: "Follow 10 more fitness accounts",
        description: "Round out your following list.",
      },
      {
        id: "d3-post",
        title: "Post a non-branded workout video (optional)",
        description: "Post a short workout clip or gym selfie to establish your account. Nothing about Gymdex yet.",
      },
    ],
  },
];

// ─── Phase Metadata ─────────────────────────────────────────────────

export const PHASE_ORDER: { id: string; label: string; icon: string }[] = [
  { id: "setup", label: "Setup", icon: "⚙️" },
  { id: "warmup", label: "Warm-up", icon: "🔥" },
  { id: "posting", label: "Posting", icon: "🎬" },
  { id: "active", label: "Active", icon: "📊" },
];
