import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@ugc.run";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ugc.run";

// ─── Email Templates ────────────────────────────────────────────────

interface EmailTemplate {
  subject: string;
  html: string;
}

function getTemplate(type: string, data: Record<string, string>): EmailTemplate {
  const name = data.name || "Creator";

  switch (type) {
    case "welcome":
      return {
        subject: "You're in! Here's what's next",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #ededed; background: #0a0a0a;">
            <h1 style="color: #a78bfa; font-size: 24px;">Welcome to Gymdex, ${name}!</h1>
            <p style="color: #9ca3af; line-height: 1.6;">You've signed the creator agreement. Now let's get you set up and earning.</p>
            <p style="color: #9ca3af; line-height: 1.6;">Your next steps:</p>
            <ol style="color: #9ca3af; line-height: 1.8;">
              <li>Set up your payment info</li>
              <li>Create your TikTok & Instagram accounts</li>
              <li>Complete the 3-day warm-up</li>
              <li>Start posting and earning $250+/month</li>
            </ol>
            <a href="${APP_URL}/gymdex/dashboard" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Go to Dashboard</a>
          </div>
        `,
      };

    case "stall_setup":
      return {
        subject: "Your account is waiting — 10 min to finish",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #ededed; background: #0a0a0a;">
            <h1 style="color: #a78bfa; font-size: 24px;">Hey ${name},</h1>
            <p style="color: #9ca3af; line-height: 1.6;">You started setting up your creator account but haven't finished yet. It only takes about 10 minutes to complete.</p>
            <p style="color: #9ca3af; line-height: 1.6;">Once you're set up, you'll be earning $250/month posting videos from your phone.</p>
            <a href="${APP_URL}/gymdex/dashboard" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Finish Setup</a>
          </div>
        `,
      };

    case "stall_warmup":
      return {
        subject: "Your warm-up tasks are ready",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #ededed; background: #0a0a0a;">
            <h1 style="color: #a78bfa; font-size: 24px;">Your warm-up tasks are ready!</h1>
            <p style="color: #9ca3af; line-height: 1.6;">${name}, your next warm-up day is unlocked. Complete the tasks to move closer to posting and earning.</p>
            <a href="${APP_URL}/gymdex/dashboard" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Continue Warm-up</a>
          </div>
        `,
      };

    case "stall_posting":
      return {
        subject: "Almost ready to start earning",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #ededed; background: #0a0a0a;">
            <h1 style="color: #a78bfa; font-size: 24px;">You're so close, ${name}!</h1>
            <p style="color: #9ca3af; line-height: 1.6;">You're in the posting guide phase. Finish reviewing the guide and you'll be ready to start posting and earning $250+/month.</p>
            <a href="${APP_URL}/gymdex/dashboard" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Continue Guide</a>
          </div>
        `,
      };

    case "missed_posts_2day":
      return {
        subject: `Your streak was at ${data.streak} days. Post today.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #ededed; background: #0a0a0a;">
            <h1 style="color: #a78bfa; font-size: 24px;">Don't lose your streak!</h1>
            <p style="color: #9ca3af; line-height: 1.6;">${name}, you had a ${data.streak}-day posting streak going. It's been 2 days since your last post.</p>
            <p style="color: #9ca3af; line-height: 1.6;">Post today to keep your streak alive and stay on track for your monthly earnings.</p>
            <a href="${APP_URL}/gymdex/dashboard" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Go to Dashboard</a>
          </div>
        `,
      };

    case "phase_complete":
      return {
        subject: `Nice work! You earned ${data.xp} XP`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #ededed; background: #0a0a0a;">
            <h1 style="color: #22c55e; font-size: 24px;">Phase Complete!</h1>
            <p style="color: #9ca3af; line-height: 1.6;">Awesome work, ${name}! You completed the ${data.phase} phase and earned ${data.xp} XP.</p>
            <p style="color: #9ca3af; line-height: 1.6;">Head to your dashboard to see what's next.</p>
            <a href="${APP_URL}/gymdex/dashboard" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #22c55e; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">View Dashboard</a>
          </div>
        `,
      };

    default:
      return {
        subject: "Update from Gymdex",
        html: `<p>You have an update on your Gymdex dashboard.</p>`,
      };
  }
}

// ─── Send Notification ───────────────────────────────────────────────

export async function sendNotification(
  creatorId: string,
  type: string,
  email: string,
  data: Record<string, string> = {}
): Promise<boolean> {
  // Check cooldown (48h per type)
  const { data: recent } = await supabase
    .from("notifications_sent")
    .select("id")
    .eq("creator_id", creatorId)
    .eq("notification_type", type)
    .gte("sent_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
    .limit(1);

  if (recent && recent.length > 0) {
    return false; // Cooldown active
  }

  const template = getTemplate(type, data);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: template.subject,
      html: template.html,
    });

    await supabase.from("notifications_sent").insert({
      creator_id: creatorId,
      notification_type: type,
      metadata: data,
    });

    return true;
  } catch {
    console.error(`Failed to send ${type} notification to ${email}`);
    return false;
  }
}
