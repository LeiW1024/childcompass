// app/api/bookings/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { getOrCreateProfile } from "@/lib/prisma/getOrCreateProfile";
import type { BookingStatus } from "@prisma/client";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

    const profile = await getOrCreateProfile(user.id, user.email ?? "", user.user_metadata);
    const { status } = await request.json();

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { listing: { select: { providerProfileId: true } }, parent: { select: { id: true } } },
    });
    if (!booking) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });

    // Parent authorization: can only cancel their own bookings
    if (profile.role !== "PROVIDER") {
      if (booking.parent.id !== profile.id)
        return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
      if (status !== "CANCELLED")
        return NextResponse.json({ data: null, error: "Parents can only cancel" }, { status: 403 });
    } else {
      // Provider authorization: must own the listing this booking is for
      const providerProfile = await prisma.providerProfile.findUnique({
        where: { profileId: profile.id },
      });
      if (!providerProfile || booking.listing.providerProfileId !== providerProfile.id)
        return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    const allowed: BookingStatus[] = ["CONFIRMED", "DECLINED", "CANCELLED"];
    if (!allowed.includes(status))
      return NextResponse.json({ data: null, error: "Invalid status" }, { status: 400 });

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status,
        // Only set respondedAt for provider actions (CONFIRMED/DECLINED)
        ...(status !== "CANCELLED" ? { respondedAt: new Date() } : {}),
      },
    });
    return NextResponse.json({ data: updated, error: null });
  } catch (err) {
    console.error("[PATCH /api/bookings/id]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
