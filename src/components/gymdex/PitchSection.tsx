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
          Get paid <span className="text-primary-light">$250+/mo</span> to post
          videos from your phone
        </h1>
        <p className="mt-4 text-lg text-muted max-w-md mx-auto">
          No experience required. No editing. 20-second clips.
        </p>
        <button
          onClick={scrollToContract}
          className="mt-6 px-8 py-4 bg-primary text-white font-bold text-lg rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all"
        >
          Join now
        </button>
      </section>

      {/* Example Video */}
      <section>
        <h2 className="text-2xl font-bold text-center text-foreground mb-4">
          Example video
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
      </section>

      {/* Value Props */}
      <section className="grid grid-cols-2 gap-3">
        {[
          { title: "50+ creators", desc: "Already signed up" },
          { title: "No editing", desc: "Raw, organic clips only" },
          { title: "Step-by-step guide", desc: "We walk you through everything" },
          { title: "~1 hour", desc: "Batch all 60 videos at once" },
        ].map((prop) => (
          <div
            key={prop.title}
            className="p-4 rounded-xl border border-border bg-surface text-center"
          >
            <h3 className="font-bold text-foreground">{prop.title}</h3>
            <p className="text-xs text-muted mt-1">{prop.desc}</p>
          </div>
        ))}
      </section>

      {/* Testimonial */}
      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-start gap-4">
          <img
            src="/images/testimonial-avatar.png"
            alt="Samantha"
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          <div>
            <p className="text-foreground leading-relaxed">
              &ldquo;Got my first $250 on March 1st. Took me an hour to film
              everything.&rdquo;
            </p>
            <p className="text-sm text-muted mt-2">Samantha R., Gymdex creator</p>
          </div>
        </div>
      </section>

      {/* What's the catch? */}
      <section>
        <h2 className="text-2xl font-bold text-center text-foreground mb-4">
          What&apos;s the catch?
        </h2>
        <div className="space-y-3">
          {[
            "Need two phones, one to film, one to hold",
            "Create a new TikTok and Instagram account",
            "Warm them up for three days before posting",
          ].map((text) => (
            <div
              key={text}
              className="flex items-start gap-3 p-3 rounded-lg border border-border bg-surface"
            >
              <svg
                className="w-5 h-5 text-primary-light mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-sm text-foreground">{text}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted mt-4">
          We give you a step-by-step guide for everything.
        </p>
      </section>

      {/* How and when you get paid */}
      <section>
        <h2 className="text-2xl font-bold text-center text-foreground mb-4">
          How and when you get paid
        </h2>
        <div className="p-5 rounded-xl border border-border bg-surface space-y-3">
          {[
            "Paid on the 1st of every month",
            "PayPal, Venmo, or Sideshift",
            "No minimum threshold",
          ].map((text) => (
            <div key={text} className="flex items-center gap-3">
              <svg
                className="w-4 h-4 text-success flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Performance Tiers */}
      <section>
        <h2 className="text-2xl font-bold text-center text-foreground mb-2">
          What our top creators earn
        </h2>
        <p className="text-center text-sm text-muted mb-6">
          Everyone starts at $250/mo. Here&apos;s what&apos;s possible.
        </p>
        <div className="space-y-3">
          {[
            { tier: "Standard", pay: "$250/mo", desc: "Starting rate, everyone begins here", color: "border-muted/30" },
            { tier: "Rising", pay: "$300/mo", desc: "90%+ daily quota for 4 weeks", color: "border-success/50" },
            { tier: "Top Performer", pay: "$400/mo", desc: "30-day streak + engagement", color: "border-primary/50" },
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
          How it works
        </h2>
        <div className="space-y-4">
          {[
            { num: "1", title: "Sign", desc: "Choose payment method and sign the creator agreement below" },
            { num: "2", title: "Set up", desc: "Create new accounts, warm them up, just follow our guide" },
            { num: "3", title: "Post & earn", desc: "Two clips a day, $250/month" },
          ].map((step) => (
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
