import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@ugc.run";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ugc.run";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Look up creator by email
    const { data: profile } = await supabase
      .from("creator_profiles")
      .select("id, legal_name, email")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (!profile) {
      // Don't reveal whether email exists
      return NextResponse.json({
        message: "If an account exists with that email, a recovery link has been sent.",
      });
    }

    // Send recovery email
    const recoveryUrl = `${APP_URL}/gymdex/dashboard?recover=${profile.id}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email.trim(),
      subject: "Your Gymdex Dashboard Link",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #ededed; background: #0a0a0a;">
          <h1 style="color: #a78bfa; font-size: 24px;">Dashboard Recovery</h1>
          <p style="color: #9ca3af; line-height: 1.6;">Hey ${profile.legal_name}, here's your dashboard link:</p>
          <a href="${recoveryUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Open Dashboard</a>
          <p style="color: #9ca3af; line-height: 1.6; margin-top: 20px; font-size: 12px;">This link will restore your session. Don't share it with others.</p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "If an account exists with that email, a recovery link has been sent.",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process recovery request" },
      { status: 500 }
    );
  }
}
