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
  examples?: string[];
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
  subtitle: "Set up your creator accounts",
  icon: "settings",
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
      title: "Phone Number",
      description: "So we can reach you if needed.",
      type: "input",
      field: "phone",
      required: true,
      placeholder: "(555) 555-5555",
    },
    {
      id: "setup-tiktok",
      title: "Create a TikTok Account",
      description: "Create a new TikTok account and submit the profile URL below.",
      type: "url",
      field: "tiktok_url",
      required: true,
      placeholder: "https://tiktok.com/@yourusername",
      details: [
        "Username should be a random first name and last name",
        "Add a random birth year if necessary (e.g. jessica.miller98)",
      ],
    },
    {
      id: "setup-instagram",
      title: "Create an Instagram Account",
      description: "Create a new Instagram account and submit the profile URL below.",
      type: "url",
      field: "instagram_url",
      required: true,
      placeholder: "https://instagram.com/yourusername",
      details: [
        "Username should be a random first name and last name",
        "Add a random birth year if necessary (e.g. jessica.miller98)",
      ],
    },
    {
      id: "setup-bio-check",
      title: "Confirm Bio & Username",
      description: "Make sure your accounts look organic. DO NOT MENTION GYMDEX.",
      type: "checkbox",
      details: [
        "Username looks like a real person (not branded)",
        "Bio is casual and organic. DO NOT mention Gymdex",
        "Profile pic is a real photo of a person",
      ],
      examples: [
        "gym rat in progress",
        "lifting heavy & eating clean",
        "just a guy who likes the gym",
        "fitness journey starts here",
        "legs > everything",
        "cardio is a personality trait",
        "protein shake enthusiast",
        "gym, sleep, repeat",
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
        description: "Like and engage naturally.",
      },
      {
        id: "d1-comment",
        title: "Comment on 5 posts",
        description: "No emojis, casual, authentic.",
      },
      {
        id: "d1-follow",
        title: "Follow 10 accounts",
        description: "",
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
        description: "Like and engage naturally.",
      },
      {
        id: "d2-comment",
        title: "Comment on 5 posts",
        description: "No emojis, casual, authentic.",
      },
      {
        id: "d2-follow",
        title: "Follow 10 more accounts",
        description: "",
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
        description: "Like and engage naturally.",
      },
      {
        id: "d3-comment",
        title: "Comment on 5 posts",
        description: "No emojis, casual, authentic.",
      },
      {
        id: "d3-follow",
        title: "Follow 10 more accounts",
        description: "",
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
  { id: "setup", label: "Setup", icon: "settings" },
  { id: "warmup", label: "Warm-up", icon: "flame" },
  { id: "posting", label: "Download", icon: "download" },
  { id: "active", label: "Active", icon: "bar-chart" },
];
