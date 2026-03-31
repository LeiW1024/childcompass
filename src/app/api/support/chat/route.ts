import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { profileRepo } from "@/lib/prisma/repositories";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId, pageUrl, lang } = body;

    // Validate message
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { data: null, error: "Message is required" },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { data: null, error: "Message is too long" },
        { status: 400 }
      );
    }

    // Attempt to get authenticated user (optional — anonymous allowed)
    let user: { id: string | null; email: string | null; fullName: string | null; role: string | null } = {
      id: null,
      email: null,
      fullName: null,
      role: null,
    };

    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        const profile = await profileRepo.findBySupabaseId(authUser.id);
        if (profile) {
          user = {
            id: profile.id,
            email: profile.email,
            fullName: profile.fullName,
            role: profile.role,
          };
        }
      }
    } catch {
      // Auth lookup failed — proceed as anonymous
    }

    // Build enriched payload for n8n
    const payload = {
      message: message.trim(),
      sessionId: sessionId || "unknown",
      timestamp: new Date().toISOString(),
      user,
      pageUrl: pageUrl || "",
      lang: lang || "en",
      source: "childcompass-chat-widget",
    };

    // Forward to n8n webhook
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("[POST /api/support/chat] N8N_WEBHOOK_URL is not configured");
      return NextResponse.json(
        { data: null, error: "Support is temporarily unavailable" },
        { status: 502 }
      );
    }

    const n8nResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!n8nResponse.ok) {
      console.error("[POST /api/support/chat] n8n returned status", n8nResponse.status);
      return NextResponse.json(
        { data: null, error: "Support request failed" },
        { status: 502 }
      );
    }

    const responseText = await n8nResponse.text();
    let reply = "Thank you for your message. We'll get back to you soon.";
    let category = "general_question";

    if (responseText) {
      try {
        const n8nRaw = JSON.parse(responseText);
        // n8n respondWith:"allIncomingItems" returns an array
        const n8nData = Array.isArray(n8nRaw) ? n8nRaw[0] : n8nRaw;
        reply = n8nData?.reply || reply;
        category = n8nData?.category || category;
      } catch {
        console.error("[POST /api/support/chat] Failed to parse n8n response:", responseText);
      }
    }

    return NextResponse.json({ data: { reply, category }, error: null });
  } catch (err) {
    console.error("[POST /api/support/chat]", err);
    return NextResponse.json(
      { data: null, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
