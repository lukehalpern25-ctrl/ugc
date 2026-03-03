export interface StepItem {
  id: string;
  title: string;
  description: string;
  details?: string[];
  image?: string;
  video?: string;
  tip?: string;
  link?: { url: string; label: string };
  important?: boolean;
  autoCheckOnWatch?: boolean;
  bottomCheckbox?: boolean;
  videoMuted?: boolean;
  videoLoop?: boolean;
  gotItButton?: boolean;
  copyableDetails?: boolean;
}

export interface Step {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  iconImage?: string;
  items: StepItem[];
}

export interface Section {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  steps: Step[];
}

const STORAGE_URL =
  "https://vfxiaiveopufqszzirlh.supabase.co/storage/v1/object/public/videos";

export const sections: Section[] = [
  // ─── SECTION 1: FORMAT SETUP ──────────────────────────────────────
  {
    id: 1,
    title: "Format Setup",
    subtitle: "Get everything downloaded and configured before filming",
    icon: "🔧",
    steps: [
      {
        id: 1,
        title: "Download Snapchat",
        subtitle: "You'll film your UGC through Snapchat",
        icon: "👻",
        iconImage: "/images/snapchat-icon.webp",
        items: [
          {
            id: "1-1-1",
            title: "Download Snapchat from the App Store",
            description:
              "Search for 'Snapchat' in the App Store and install it. If you already have it, make sure it's updated to the latest version.",
          },
          {
            id: "1-1-2",
            title: "Log in or create a Snapchat account",
            description:
              "Open Snapchat and sign in. If you don't have an account, create one — it only takes a minute.",
          },
        ],
      },
      {
        id: 2,
        title: "Download Gymdex via TestFlight",
        subtitle: "Install the beta version of Gymdex",
        icon: "📲",
        iconImage: "/images/testflight-icon.webp",
        items: [
          {
            id: "1-2-1",
            title: "Download the TestFlight app",
            description:
              "TestFlight is Apple's app for installing beta apps. Search for 'TestFlight' in the App Store and install it.",
            link: {
              url: "https://apps.apple.com/us/app/testflight/id899247664",
              label: "Open TestFlight in App Store",
            },
          },
          {
            id: "1-2-2",
            title: "Open the Gymdex TestFlight link",
            description:
              "Tap the link below to join the Gymdex beta. This will open TestFlight and prompt you to install Gymdex.",
            link: {
              url: "https://testflight.apple.com/join/hdqzRvB8",
              label: "Join Gymdex Beta",
            },
            important: true,
          },
          {
            id: "1-2-3",
            title: "Install Gymdex from TestFlight",
            description:
              'Once the TestFlight link opens, tap "Accept" and then "Install" to download Gymdex. Open the app to make sure it launches correctly.',
          },
          {
            id: "1-2-4",
            title: "Go through the onboarding",
            description:
              "Open Gymdex and complete the full onboarding flow. When you reach the paywall, go ahead and tap to purchase — all purchases in TestFlight are fake test transactions and will NOT charge you. This just lets you get into the full app.",
            important: true,
          },
        ],
      },
      {
        id: 3,
        title: "Add Gymdex to TikTok Share",
        subtitle: "Set up Gymdex as a share export option in TikTok",
        icon: "📤",
        items: [
          {
            id: "1-3-1",
            title: "Add Gymdex to your top 4 share apps on TikTok",
            description:
              "Open TikTok and go to any video. Tap the Share button (arrow icon on the right). Scroll the bottom row of app icons to the right and tap \"More\". Find Gymdex in the list and drag it into your top 4 share apps (the first row). It should look like this when done:",
            details: [
              "Open TikTok → tap Share on any video",
              "Scroll the share row to the right → tap \"More\"",
              "Find Gymdex → drag it into the top 4 (first row)",
            ],
            image: "/images/tiktok-share-export.png",
            video: `${STORAGE_URL}/tiktok-share-setup.mp4`,
            important: true,
            bottomCheckbox: true,
          },
        ],
      },
    ],
  },

  // ─── SECTION 2: VIDEO SETUP ───────────────────────────────────────
  {
    id: 2,
    title: "Video Setup",
    subtitle: "Understand the filming format and environment",
    icon: "🎥",
    steps: [
      {
        id: 4,
        title: "Equipment & Filming Format",
        subtitle: "What you need and how the video flows",
        icon: "📱",
        items: [
          {
            id: "2-1-1",
            title: "You will need 2 iPhones",
            description:
              "One iPhone will be used to film on Snapchat (your main camera). The second iPhone is what you'll use to demo the Gymdex app on screen.",
            important: true,
          },
          {
            id: "2-1-2",
            title: "Film everything on Snapchat in one continuous video",
            description:
              "The entire UGC video must be filmed as a single, uncut Snapchat video. Do NOT stop and start — keep it flowing naturally as one take. This is what gives it the organic, authentic feel.",
            important: true,
          },
        ],
      },
      {
        id: 5,
        title: "Filming Environment",
        subtitle: "Where to film your UGC",
        icon: "🏠",
        items: [
          {
            id: "2-2-1",
            title: "Option A: At home with a show/video playing loudly",
            description:
              "Film at home with a TV show or YouTube video playing audibly in the background. This creates a casual, everyday vibe. More examples can be found in the Resources tab.",
            video: `${STORAGE_URL}/example-home.mov`,
            autoCheckOnWatch: true,
          },
          {
            id: "2-2-2",
            title: "Option B: Loud public area (bar/restaurant)",
            description:
              "Film in a bar, restaurant, or loud public setting. The background noise and vibe makes the video feel super organic — like you just stumbled across something cool. More examples can be found in the Resources tab.",
            video: `${STORAGE_URL}/example-bar.mp4`,
            autoCheckOnWatch: true,
          },
        ],
      },
    ],
  },

  // ─── SECTION 3: HOW TO FILM ───────────────────────────────────────
  {
    id: 3,
    title: "How to Film",
    subtitle: "Step-by-step filming instructions for the reaction and demo",
    icon: "🎬",
    steps: [
      {
        id: 6,
        title: "How to Film a Reaction",
        subtitle: "The first part of your video — the reaction clip",
        icon: "😲",
        items: [
          {
            id: "3-1-1",
            title: "Start with phone farther from your face",
            description:
              "Start with the phone farther from your face with a slight reaction — like you just saw something interesting on your other phone.",
            image: "/images/reaction-start.png",
          },
          {
            id: "3-1-2",
            title: "Move the phone closer and switch the camera (~2 sec)",
            description:
              "Quickly bring the phone closer to your face and flip the camera to show the second iPhone's screen. Try to make this transition about 2 seconds — keep it fast and natural.",
            tip: "Practice the camera flip a few times before recording. The faster and smoother this is, the better the video looks.",
            video: `${STORAGE_URL}/example-reaction-flip.mov`,
            autoCheckOnWatch: true,
          },
        ],
      },
      {
        id: 7,
        title: "How to Film a Demo",
        subtitle: "Showing the Gymdex app in action",
        icon: "📋",
        items: [
          {
            id: "3-2-1",
            title: "Let the TikTok video play for 1 second before sharing",
            description:
              "When you switch the camera onto the second phone showing a TikTok video, let it play for about 1 second before you tap the share button and export to Gymdex. This makes it feel natural.",
            video: `${STORAGE_URL}/example-demo-share.mov`,
            videoMuted: true,
            videoLoop: true,
            gotItButton: true,
            important: true,
          },
          {
            id: "3-2-2",
            title: "Go through the export process quickly",
            description:
              "Once you tap share → Gymdex, move through the export/import screens quickly. Don't linger — tap through it with confidence.",
            video: `${STORAGE_URL}/example-demo-export.mov`,
            videoMuted: true,
            videoLoop: true,
            gotItButton: true,
          },
          {
            id: "3-2-3",
            title: "Show the workout with short scrolls",
            description:
              "Once you're inside the workout in Gymdex, do short little scrolls down to show the full routine and the muscles diagram. Don't rush but don't go too slow — just a casual scroll-through.",
            video: `${STORAGE_URL}/example-demo-scroll.mov`,
            videoMuted: true,
            videoLoop: true,
            gotItButton: true,
          },
        ],
      },
      {
        id: 8,
        title: "Adding Snapchat Text",
        subtitle: "Add text overlay to your Snap before sending",
        icon: "✏️",
        items: [
          {
            id: "3-3-1",
            title: "Add a text caption on Snapchat",
            description:
              "After recording your Snap, tap the screen or the text icon (T) to add a text overlay. Copy/paste one of these exactly:",
            image: "/images/snapchat-text-example.png",
            details: [
              'bruh I\'ve been working out for 4 years and just now find out about this...',
              'bro i\'ve been working out for 4yrs in the gym and am just now finding out abt this??',
              'who was going to tell me about this when I started working out…',
            ],
            copyableDetails: true,
          },
          {
            id: "3-3-2",
            title: "Keep the text style default",
            description:
              "Use the default Snapchat text style — don't over-design it. The more casual and raw it looks, the more organic the video feels. Place it near the top or center of the screen so it's easy to read.",
          },
        ],
      },
    ],
  },

  // ─── SECTION 4: CAPTIONS, AUDIO & HASHTAGS ────────────────────────
  {
    id: 4,
    title: "Captions, Audio & Hashtags",
    subtitle: "What to write and how to post",
    icon: "✍️",
    steps: [
      {
        id: 9,
        title: "Audio",
        subtitle: "Do NOT add any music to your post",
        icon: "🔇",
        items: [
          {
            id: "4-0-1",
            title: "Do NOT add music or sounds to your TikTok",
            description:
              "When posting, do not add any TikTok sounds or music. The only audio should be the natural background noise from your environment (bar, restaurant, or show playing at home). This is what makes it feel organic.",
            important: true,
          },
        ],
      },
      {
        id: 10,
        title: "Captions",
        subtitle: "Keep it super organic — never mention the app by name",
        icon: "💬",
        items: [
          {
            id: "4-1-1",
            title: 'DO NOT mention "app" or "Gymdex" in your caption',
            description:
              "The caption should feel like an organic, personal post. Never mention the app by name or use the word \"app\" — keep it real.",
            important: true,
          },
          {
            id: "4-1-2",
            title: "Use captions like these examples",
            description:
              "Your captions should feel like genuine reactions. Here are some examples:",
            details: [
              '"This saved meeee"',
              '"I legit got my dream body from this"',
              '"Why did no one tell me about this sooner"',
              '"ok this actually works wtf"',
              '"bro this changed everything for me"',
            ],
          },
        ],
      },
      {
        id: 11,
        title: "Hashtags",
        subtitle: "Use 3-4 hashtags per post",
        icon: "#️⃣",
        items: [
          {
            id: "4-2-1",
            title: "Choose 3-4 hashtags from this list",
            description:
              "Mix and match these hashtags. You can swap some out for whatever is currently trending in the fitness/gym space.",
            details: [
              "#gymtok",
              "#weightlosshacks",
              "#gymhacks",
              "#gymdex",
              "#gymapps",
              "#bestgymapps2026",
            ],
          },
        ],
      },
    ],
  },

  // ─── SECTION 5: COMMENTS ──────────────────────────────────────────
  {
    id: 5,
    title: "Comments",
    subtitle: "Engaging with comments is essential for reach",
    icon: "💬",
    steps: [
      {
        id: 12,
        title: "Responding to Comments",
        subtitle: "This is critical for growing reach",
        icon: "🔥",
        items: [
          {
            id: "5-1-1",
            title: "Respond to EVERY comment",
            description:
              "It is ESSENTIAL that you respond to comments on your posts. The TikTok algorithm heavily rewards engagement — the more you reply, the more the video gets pushed.",
            important: true,
          },
          {
            id: "5-1-2",
            title: "Answer questions about Gymdex naturally",
            description:
              'When people ask "what app is that?" or "how do I get this?", reply casually and helpfully. Just say the name. Keep it conversational, not salesy.',
            details: [
              '"it\'s called Gymdex!"',
              '"Gymdex — it literally changed my routine"',
            ],
          },
          {
            id: "5-1-3",
            title: "Engage quickly after posting",
            description:
              "Try to respond to comments within the first 1-2 hours of posting. This is when the algorithm is deciding whether to push your video — early engagement signals are huge.",
            tip: "Turn on post notifications so you see comments immediately.",
          },
        ],
      },
    ],
  },
];

// Flatten all items across all sections for progress tracking
export function getAllItems() {
  return sections.flatMap((section) =>
    section.steps.flatMap((step) => step.items)
  );
}

export function getTotalItemCount() {
  return getAllItems().length;
}

// Weighted progress — earlier items contribute more percentage than later ones
export function getWeightedProgress(completedItems: Set<string>): number {
  const allItems = getAllItems();
  const n = allItems.length;
  // Assign decreasing weights: first item gets weight n, last gets weight 1
  const totalWeight = (n * (n + 1)) / 2;
  let completedWeight = 0;
  allItems.forEach((item, index) => {
    if (completedItems.has(item.id)) {
      completedWeight += n - index;
    }
  });
  return Math.round((completedWeight / totalWeight) * 100);
}

// Resource sections for Resources tab
export interface ResourceItem {
  id: string;
  title: string;
  description?: string;
  file?: string;
  youtubeId?: string;
  url?: string;
  thumbnail?: string;
  impressions?: string;
  copyTexts?: string[];
}

export interface ResourceSection {
  id: string;
  title: string;
  icon: string;
  description?: string;
  items: ResourceItem[];
}

export const resourceSections: ResourceSection[] = [
  {
    id: "example-winners",
    title: "Example Winners",
    icon: "🏆",
    items: [
      {
        id: "win-1",
        title: "",
        file: `${STORAGE_URL}/example-bar.mp4`,
        impressions: "58K",
      },
      {
        id: "win-2",
        title: "",
        file: `${STORAGE_URL}/example-home.mov`,
        impressions: "571K",
      },
      {
        id: "win-3",
        title: "",
        file: `${STORAGE_URL}/winner-3.mp4`,
        impressions: "47K",
      },
      {
        id: "win-4",
        title: "",
        file: `${STORAGE_URL}/winner-4.mp4`,
        impressions: "41K",
      },
    ],
  },
  {
    id: "background-audio",
    title: "Background Audio",
    icon: "🔊",
    description: "Skip to some random part in the middle of the video and play from there.",
    items: [
      {
        id: "audio-1",
        title: "",
        youtubeId: "zTD57bOhXMA",
      },
      {
        id: "audio-2",
        title: "",
        youtubeId: "BTcNIbIfj40",
      },
    ],
  },
  {
    id: "workout-videos",
    title: "Workout Videos to Import",
    icon: "💪",
    description: "Open one of these TikToks on your second phone and use it during filming.",
    items: [
      {
        id: "workout-1",
        title: "",
        url: "https://www.tiktok.com/t/ZP89KHHxt/",
        thumbnail: "/images/workout-thumb-1-new.png",
      },
      {
        id: "workout-2",
        title: "",
        url: "https://www.tiktok.com/t/ZP89KvhG9/",
        thumbnail: "/images/workout-thumb-5.png",
      },
      {
        id: "workout-3",
        title: "",
        url: "https://www.tiktok.com/@valerianayaaa/video/7539972501330267406",
        thumbnail: "/images/workout-thumb-3.png",
      },
      {
        id: "workout-4",
        title: "",
        url: "https://www.tiktok.com/t/ZP89K48yp/",
        thumbnail: "/images/workout-thumb-1.png",
      },
      {
        id: "workout-5",
        title: "",
        url: "https://www.tiktok.com/t/ZP89K9oa7/",
        thumbnail: "/images/workout-thumb-4.png",
      },
      {
        id: "workout-6",
        title: "",
        url: "https://www.tiktok.com/@valerianayaaa/video/7600103450109562143",
        thumbnail: "/images/workout-thumb-6.png",
      },
    ],
  },
  {
    id: "captions-text",
    title: "Captions & Snapchat Text",
    icon: "✏️",
    items: [
      {
        id: "text-snap",
        title: "Snapchat Text Overlays",
        description: "Copy and paste one of these onto your Snap after recording:",
        thumbnail: "/images/snapchat-text-example.png",
        copyTexts: [
          'bruh I\'ve been working out for 4 years and just now find out about this...',
          'bro i\'ve been working out for 4yrs in the gym and am just now finding out abt this??',
          'who was going to tell me about this when I started working out…',
        ],
      },
      {
        id: "text-captions",
        title: "TikTok Captions",
        description: "Use one of these as your TikTok post caption (never mention the app name):",
        copyTexts: [
          'This saved meeee',
          'I legit got my dream body from this',
          'Why did no one tell me about this sooner',
          'ok this actually works wtf',
          'bro this changed everything for me',
        ],
      },
    ],
  },
];
