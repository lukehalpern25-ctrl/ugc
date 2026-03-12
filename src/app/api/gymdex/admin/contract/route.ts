import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { CONTRACT_TEXT, CONTRACT_VERSION } from "@/lib/gymdex/contract";
import { jsPDF } from "jspdf";

export async function GET(request: NextRequest) {
  const password = request.nextUrl.searchParams.get("key");
  const adminKey = process.env.ADMIN_KEY || "gymdex-admin";

  if (password !== adminKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const creatorId = request.nextUrl.searchParams.get("creatorId");
  if (!creatorId) {
    return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
  }

  const { data: creator, error } = await supabase
    .from("creator_profiles")
    .select("legal_name, contract_signed_at, contract_ip_address, contract_user_agent, contract_version, payment_method, payment_handle")
    .eq("id", creatorId)
    .single();

  if (error || !creator) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  // Generate PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("BURD LLC Content Creator Agreement", margin, y);
  y += 12;

  // Contract text
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const lines = doc.splitTextToSize(CONTRACT_TEXT, maxWidth);
  for (const line of lines) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, margin, y);
    y += 5;
  }

  // Signature section
  y += 10;
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("ELECTRONIC SIGNATURE", margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const signedDate = new Date(creator.contract_signed_at).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "long",
  });

  const signatureInfo = [
    `Signed by: ${creator.legal_name}`,
    `Date: ${signedDate}`,
    `Contract Version: ${creator.contract_version || CONTRACT_VERSION}`,
    `IP Address: ${creator.contract_ip_address || "N/A"}`,
    `Payment Method: ${creator.payment_method || "N/A"}`,
    `Payment Handle: ${creator.payment_handle || "N/A"}`,
    "",
    `User Agent: ${creator.contract_user_agent || "N/A"}`,
  ];

  for (const info of signatureInfo) {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    const infoLines = doc.splitTextToSize(info, maxWidth);
    for (const line of infoLines) {
      doc.text(line, margin, y);
      y += 5;
    }
  }

  // Generate PDF buffer
  const pdfBuffer = doc.output("arraybuffer");

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="contract-${creator.legal_name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`,
    },
  });
}
