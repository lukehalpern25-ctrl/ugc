import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { CONTRACT_VERSION } from "@/lib/gymdex/contract";
import { awardBadge } from "@/lib/gymdex/gamification";
import { sendNotification } from "@/lib/gymdex/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { legal_name, payment_method, payment_handle } = body;

    if (!legal_name || typeof legal_name !== "string" || legal_name.trim().length < 2) {
      return NextResponse.json(
        { error: "Legal name is required (minimum 2 characters)" },
        { status: 400 }
      );
    }

    const validPaymentMethods = ["paypal", "venmo", "sideshift"];
    if (!payment_method || !validPaymentMethods.includes(payment_method)) {
      return NextResponse.json(
        { error: "Valid payment method is required" },
        { status: 400 }
      );
    }

    if (!payment_handle || typeof payment_handle !== "string" || payment_handle.trim().length < 3) {
      return NextResponse.json(
        { error: "Payment handle is required (minimum 3 characters)" },
        { status: 400 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const { data, error } = await supabase
      .from("creator_profiles")
      .insert({
        legal_name: legal_name.trim(),
        payment_method,
        payment_handle: payment_handle.trim(),
        contract_ip_address: ip === "unknown" ? null : ip.split(",")[0].trim(),
        contract_user_agent: userAgent,
        contract_version: CONTRACT_VERSION,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Contract sign error:", error);
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }

    // Award signed_up badge
    await awardBadge(data.id, "signed_up");

    // Send welcome email later (when they add email in setup)
    // For now just return the ID

    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
