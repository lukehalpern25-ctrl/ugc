import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const allowedFields = ["tiktok_url", "tiktok_username", "instagram_url", "instagram_username"];
  const updates: Record<string, string> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  // Validate TikTok URL
  if (updates.tiktok_url) {
    const tiktokRegex = /^https?:\/\/(www\.)?tiktok\.com\/@[\w.]+\/?$/i;
    if (!tiktokRegex.test(updates.tiktok_url)) {
      return NextResponse.json(
        { error: "Please enter a valid TikTok profile URL (e.g. https://tiktok.com/@username)" },
        { status: 400 }
      );
    }
  }

  // Validate Instagram URL
  if (updates.instagram_url) {
    const instagramRegex = /^https?:\/\/(www\.)?instagram\.com\/[\w.]+\/?$/i;
    if (!instagramRegex.test(updates.instagram_url)) {
      return NextResponse.json(
        { error: "Please enter a valid Instagram profile URL (e.g. https://instagram.com/username)" },
        { status: 400 }
      );
    }
  }

  // Auto-extract username from URL
  if (updates.tiktok_url && !updates.tiktok_username) {
    const match = updates.tiktok_url.match(/@([^/?]+)/);
    if (match) updates.tiktok_username = match[1];
  }
  if (updates.instagram_url && !updates.instagram_username) {
    const match = updates.instagram_url.match(/instagram\.com\/([^/?]+)/);
    if (match) updates.instagram_username = match[1];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("creator_profiles")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, updated: updates });
}
