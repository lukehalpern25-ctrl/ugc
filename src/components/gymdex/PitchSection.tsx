"use client";

import InlineVideo from "@/components/InlineVideo";

const STORAGE_URL =
  "https://vfxiaiveopufqszzirlh.supabase.co/storage/v1/object/public/videos";

export default function PitchSection() {
  const scrollToContract = () => {
    document.getElementById("contract")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center pt-8">
        <h1 className="text-4xl font-bold text-foreground leading-tight">
          Get Paid <span className="text-primary-light">$250+/mo</span> to Post
          Videos From Your Phone
        </h1>
        <p className="mt-4 text-lg text-muted max-w-md mx-auto">
          No editing. No fancy equipment. Film quick clips, post them, and get
          paid every month.
        </p>
        <button
          onClick={scrollToContract}
          className="mt-6 px-8 py-4 bg-primary text-white font-bold text-lg rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all"
        >
          Join Now
        </button>
      </section>

      {/* Pitch Video */}
      <section>
        <div className="rounded-xl overflow-hidden border border-border bg-surface-light max-w-sm mx-auto">
          <InlineVideo
            src={`${STORAGE_URL}/pitch-video.mp4`}
            className="w-full aspect-[9/16]"
          />
        </div>
        <p className="text-center text-sm text-muted mt-3">
          Watch how it works (2 min)
        </p>
      </section>

      {/* Value Props */}
      <section className="grid grid-cols-2 gap-3">
        {[
          { icon: "💰", title: "$250/month", desc: "Guaranteed base pay" },
          { icon: "✂️", title: "No Editing", desc: "Raw, organic clips only" },
          { icon: "📱", title: "Film on Your Phone", desc: "2 iPhones is all you need" },
          { icon: "⏱️", title: "~1 Hour", desc: "Batch all 60 videos at once" },
        ].map((prop) => (
          <div
            key={prop.title}
            className="p-4 rounded-xl border border-border bg-surface text-center"
          >
            <span className="text-3xl">{prop.icon}</span>
            <h3 className="font-bold text-foreground mt-2">{prop.title}</h3>
            <p className="text-xs text-muted mt-1">{prop.desc}</p>
          </div>
        ))}
      </section>

      {/* Example Success */}
      <section>
        <h2 className="text-2xl font-bold text-center text-foreground mb-4">
          Real Results
        </h2>
        <div className="rounded-xl overflow-hidden border border-border bg-surface-light max-w-xs mx-auto relative">
          <InlineVideo
            src={`${STORAGE_URL}/example-home.mov`}
            className="w-full aspect-[9/16]"
          />
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
            571K views
          </div>
        </div>
        <p className="text-center text-sm text-muted mt-3">
          One of our creators hit 571K views on a single video
        </p>
      </section>

      {/* Performance Tiers */}
      <section>
        <h2 className="text-2xl font-bold text-center text-foreground mb-2">
          Earn More as You Level Up
        </h2>
        <p className="text-center text-sm text-muted mb-6">
          Our best creators get promoted every month
        </p>
        <div className="space-y-3">
          {[
            { tier: "Standard", pay: "$250/mo", desc: "Starting rate", color: "border-muted/30", active: true },
            { tier: "Rising", pay: "$300/mo", desc: "90%+ daily quota for 2 weeks", color: "border-success/50" },
            { tier: "Top Performer", pay: "$400/mo", desc: "14-day streak + engagement", color: "border-primary/50" },
            { tier: "Elite", pay: "$500/mo", desc: "30-day streak + top metrics", color: "border-gold/50" },
          ].map((t) => (
            <div
              key={t.tier}
              className={`flex items-center justify-between p-4 rounded-xl border ${t.color} bg-surface`}
            >
              <div>
                <h3 className="font-bold text-foreground">{t.tier}</h3>
                <p className="text-xs text-muted">{t.desc}</p>
              </div>
              <span className="text-lg font-bold text-primary-light">{t.pay}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section>
        <h2 className="text-2xl font-bold text-center text-foreground mb-6">
          How It Works
        </h2>
        <div className="space-y-4">
          {[
            { num: "1", title: "Sign", desc: "Read & sign the creator agreement below" },
            { num: "2", title: "Set Up", desc: "Create accounts, complete the warm-up, learn the posting format" },
            { num: "3", title: "Post & Earn", desc: "Post 4 videos/day and get paid $250+/month" },
          ].map((step, i) => (
            <div key={step.num} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-light font-bold">{step.num}</span>
              </div>
              <div>
                <h3 className="font-bold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
