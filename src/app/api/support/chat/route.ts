import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

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

    // Build payload — minimum structure for n8n
    const payload = {
      message: message.trim(),
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

    const n8nData = await n8nResponse.json();
    const reply = n8nData?.reply || "Thank you for your message. We'll get back to you soon.";
    const category = n8nData?.category || "general_question";

    return NextResponse.json({ data: { reply, category }, error: null });
  } catch (err) {
    console.error("[POST /api/support/chat]", err);
    return NextResponse.json(
      { data: null, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
