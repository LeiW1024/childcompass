// app/api/providers/[id]/route.ts
// GET    /api/providers/:id    — fetch single provider
// PATCH  /api/providers/:id    — update provider fields
// DELETE /api/providers/:id    — delete provider

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { providerRepo } from "@/lib/prisma/repositories";

type Params = { params: { id: string } };

async function authenticate() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await authenticate();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const provider = await providerRepo.findById(params.id);
    if (!provider) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ data: provider });
  } catch (err) {
    console.error("[GET /api/providers/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await authenticate();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const allowedFields = ["type", "name", "specialty", "phone", "email", "address", "website", "notes"];
    const data = Object.fromEntries(
      Object.entries(body).filter(([k]) => allowedFields.includes(k))
    );

    const provider = await providerRepo.update(params.id, data);
    return NextResponse.json({ data: provider });
  } catch (err) {
    console.error("[PATCH /api/providers/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await authenticate();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await providerRepo.delete(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[DELETE /api/providers/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
