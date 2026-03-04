import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendNotification } from "@/lib/gymdex/notifications";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const allowedFields = ["email", "phone", "payment_method", "payment_handle"];
  const updates: Record<string, string> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  // Validate email format
  if (updates.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updates.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
  }

  // Validate payment method
  if (updates.payment_method && !["paypal", "venmo", "sideshift"].includes(updates.payment_method)) {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }

  const { error } = await supabase
    .from("creator_profiles")
    .update(updates)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send welcome email if email was just set
  if (updates.email) {
    const { data: profile } = await supabase
      .from("creator_profiles")
      .select("legal_name")
      .eq("id", id)
      .single();

    if (profile) {
      await sendNotification(id, "welcome", updates.email, {
        name: profile.legal_name,
      });
    }
  }

  return NextResponse.json({ success: true, updated: updates });
}
