// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { getOrCreateProfile } from "@/lib/prisma/getOrCreateProfile";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const profile = await getOrCreateProfile(user.id, user.email ?? "", user.user_metadata);
    const bookings = await prisma.booking.findMany({
      where: { parentId: profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        listing: { include: { providerProfile: { select: { businessName: true } } } },
        child: true,
      },
    });
    return NextResponse.json({ data: bookings });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    const profile = await getOrCreateProfile(user.id, user.email ?? "", user.user_metadata);

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });

    const { listingId, childId, message } = body;
    if (!listingId || !childId)
      return NextResponse.json({ error: "listingId and childId required" }, { status: 400 });

    const booking = await prisma.booking.create({
      data: {
        message: message ?? null,
        listing: { connect: { id: listingId } },
        parent:  { connect: { id: profile.id } },
        child:   { connect: { id: childId } },
      },
    });
    return NextResponse.json({ data: booking }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002")
      return NextResponse.json({ error: "Buchung für dieses Kind existiert bereits" }, { status: 409 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
