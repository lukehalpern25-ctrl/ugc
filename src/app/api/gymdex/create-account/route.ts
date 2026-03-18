import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { CONTRACT_VERSION } from "@/lib/gymdex/contract";
import { awardBadge } from "@/lib/gymdex/gamification";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, legal_name, payment_method, payment_handle } = body;

    // Validate email
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Validate password
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Validate legal name
    if (!legal_name || typeof legal_name !== "string" || legal_name.trim().length < 2) {
      return NextResponse.json(
        { error: "Legal name is required (minimum 2 characters)" },
        { status: 400 }
      );
    }

    // Validate payment method
    const validPaymentMethods = ["paypal", "venmo", "sideshift"];
    if (!payment_method || !validPaymentMethods.includes(payment_method)) {
      return NextResponse.json(
        { error: "Valid payment method is required" },
        { status: 400 }
      );
    }

    // Validate payment handle
    if (!payment_handle || typeof payment_handle !== "string" || payment_handle.trim().length < 3) {
      return NextResponse.json(
        { error: "Payment handle is required (minimum 3 characters)" },
        { status: 400 }
      );
    }

    // Create auth user using admin API (no email confirmation required)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      console.error("Auth user creation error:", authError);
      // Handle specific errors
      if (authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    const authId = authData.user.id;

    // Get request metadata
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create creator profile with auth_id
    const { data: profileData, error: profileError } = await supabase
      .from("creator_profiles")
      .insert({
        auth_id: authId,
        legal_name: legal_name.trim(),
        email: email.trim(),
        payment_method,
        payment_handle: payment_handle.trim(),
        contract_signed_at: new Date().toISOString(),
        contract_ip_address: ip === "unknown" ? null : ip.split(",")[0].trim(),
        contract_user_agent: userAgent,
        contract_version: CONTRACT_VERSION,
      })
      .select("id")
      .single();

    if (profileError) {
      console.error("Creator profile creation error:", profileError);
      // Attempt to clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authId);

      // Handle duplicate email
      if (profileError.message.includes("duplicate key") || profileError.message.includes("unique constraint")) {
        return NextResponse.json(
          { error: "An account with this email already exists. Try signing in instead." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }

    // Award signed_up badge
    await awardBadge(profileData.id, "signed_up");

    return NextResponse.json({ id: profileData.id });
  } catch (err) {
    console.error("Create account error:", err);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
