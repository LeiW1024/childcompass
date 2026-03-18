// app/api/admin/listings/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

type Params = { params: { id: string } };

const ALLOWED_FIELDS = [
  "title", "description", "category", "ageMinMonths", "ageMaxMonths",
  "price", "pricePer", "address", "city", "scheduleNotes", "spotsTotal",
  "maxParticipants", "datePeriods", "availableTimes", "imageUrl",
  "isPublished", "isAdminSeeded", "latitude", "longitude",
] as const;

export async function PATCH(request: Request, { params }: Params) {
  try {
    const body = await request.json();
    const data: Record<string, any> = { updatedAt: new Date() };
    for (const field of ALLOWED_FIELDS) {
      if (field in body) data[field] = body[field];
    }

    const listing = await prisma.listing.update({ where: { id: params.id }, data });
    return NextResponse.json({ data: listing, error: null });
  } catch (err) {
    console.error("[PATCH /api/admin/listings/:id]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await prisma.listing.delete({ where: { id: params.id } });
    return NextResponse.json({ data: null, error: null });
  } catch (err) {
    console.error("[DELETE /api/admin/listings/:id]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
