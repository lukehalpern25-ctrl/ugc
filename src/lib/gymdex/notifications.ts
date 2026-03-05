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
  const name = data.name || "there";

  switch (type) {
    case "welcome":
      return {
        subject: "hey, you're in",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
            <p style="font-size: 16px; line-height: 1.6;">hey ${name},</p>
            <p style="font-size: 16px; line-height: 1.6;">you're signed up. here's what to do next:</p>
            <ol style="font-size: 16px; line-height: 1.8;">
              <li>add your payment info</li>
              <li>create your tiktok & instagram accounts</li>
              <li>do the 3-day warm-up</li>
              <li>start posting</li>
            </ol>
            <p style="font-size: 16px; line-height: 1.6;">takes like 10 min to set up, then you're good to go.</p>
            <a href="${APP_URL}/gymdex/dashboard" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">go to dashboard</a>
            <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">- luke</p>
          </div>
        `,
      };

    case "stall_setup":
      return {
        subject: "quick reminder",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
            <p style="font-size: 16px; line-height: 1.6;">hey ${name},</p>
            <p style="font-size: 16px; line-height: 1.6;">noticed you haven't finished setting up yet. it's like 10 min max.</p>
            <p style="font-size: 16px; line-height: 1.6;">once you're done you can start posting and earning.</p>
            <a href="${APP_URL}/gymdex/dashboard" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">finish setup</a>
            <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">- luke</p>
          </div>
        `,
      };

    case "stall_warmup":
      return {
        subject: "your next warm-up day is ready",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
            <p style="font-size: 16px; line-height: 1.6;">hey ${name},</p>
            <p style="font-size: 16px; line-height: 1.6;">your next warm-up day just unlocked. hop in and knock it out when you get a sec.</p>
            <a href="${APP_URL}/gymdex/dashboard" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">continue warm-up</a>
            <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">- luke</p>
          </div>
        `,
      };

    case "stall_posting":
      return {
        subject: "you're almost there",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
            <p style="font-size: 16px; line-height: 1.6;">hey ${name},</p>
            <p style="font-size: 16px; line-height: 1.6;">just gotta finish reading through the posting guide and you're ready to start earning.</p>
            <a href="${APP_URL}/gymdex/dashboard" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">finish guide</a>
            <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">- luke</p>
          </div>
        `,
      };

    case "missed_posts_2day":
      return {
        subject: "hey, don't lose your streak",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
            <p style="font-size: 16px; line-height: 1.6;">hey ${name},</p>
            <p style="font-size: 16px; line-height: 1.6;">you had a ${data.streak}-day streak going. it's been a couple days since you posted.</p>
            <p style="font-size: 16px; line-height: 1.6;">no pressure, just wanted to give you a heads up before it resets.</p>
            <a href="${APP_URL}/gymdex/dashboard" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">go to dashboard</a>
            <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">- luke</p>
          </div>
        `,
      };

    default:
      return {
        subject: "quick update",
        html: `<p>hey, you've got an update on your dashboard.</p>`,
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
