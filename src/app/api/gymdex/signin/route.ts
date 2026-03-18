import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Get the creator profile ID
    const { data: profile, error: profileError } = await supabase
      .from("creator_profiles")
      .select("id")
      .eq("auth_id", authData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "No creator profile found for this account" },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: profile.id });
  } catch (err) {
    console.error("Sign in error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
