// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { getOrCreateProfile } from "@/lib/prisma/getOrCreateProfile";
import { sendBookingRequestEmail } from "@/lib/email";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    const profile = await getOrCreateProfile(user.id, user.email ?? "", user.user_metadata);
    const bookings = await prisma.booking.findMany({
      where: { parentId: profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        listing: { include: { providerProfile: { select: { businessName: true } } } },
        child: true,
      },
    });
    return NextResponse.json({ data: bookings, error: null });
  } catch (err) {
    console.error("[GET /api/bookings]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    const profile = await getOrCreateProfile(user.id, user.email ?? "", user.user_metadata);

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ data: null, error: "Invalid request" }, { status: 400 });

    const { listingId, childId, message } = body;
    if (!listingId || !childId)
      return NextResponse.json({ data: null, error: "listingId and childId required" }, { status: 400 });

    // Verify listing exists and is published
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || !listing.isPublished)
      return NextResponse.json({ data: null, error: "Listing not found or not available" }, { status: 404 });

    // Verify child belongs to the authenticated parent
    const child = await prisma.child.findFirst({ where: { id: childId, parentId: profile.id } });
    if (!child)
      return NextResponse.json({ data: null, error: "Child not found" }, { status: 404 });

    const booking = await prisma.booking.create({
      data: {
        message: message ?? null,
        listing: { connect: { id: listingId } },
        parent:  { connect: { id: profile.id } },
        child:   { connect: { id: childId } },
      },
    });

    // Fire-and-forget: notify provider. Fetch provider profile with email relation.
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { id: listing.providerProfileId },
      include: { profile: { select: { email: true, fullName: true } } },
    });
    if (providerProfile?.profile?.email) {
      sendBookingRequestEmail(providerProfile.profile.email, {
        providerName: providerProfile.businessName,
        parentName: profile.fullName ?? profile.email,
        childName: child.firstName,
        listingTitle: listing.title,
        message: message ?? undefined,
        dashboardUrl:
          (process.env.NEXT_PUBLIC_APP_URL ?? "") + "/dashboard/provider/bookings",
      }).catch((err) => {
        console.error("[POST /api/bookings] email failed", err);
      });
    }

    return NextResponse.json({ data: booking, error: null }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code: string }).code === "P2002")
      return NextResponse.json({ data: null, error: "Booking already exists for this child" }, { status: 409 });
    console.error("[POST /api/bookings]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
