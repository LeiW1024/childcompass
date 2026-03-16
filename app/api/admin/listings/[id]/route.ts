// app/api/admin/listings/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  const data = await request.json();
  const listing = await prisma.listing.update({ where: { id: params.id }, data });
  return NextResponse.json({ data: listing });
}

export async function DELETE(_req: Request, { params }: Params) {
  await prisma.listing.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
