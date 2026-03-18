// lib/prisma/getOrCreateProfile.ts
// Shared helper: always returns a valid Profile row for a Supabase user.
// Safe for Google OAuth users who may not have a DB row yet.
// The update clause always sets updatedAt to avoid Prisma empty-update errors.

import { prisma } from "./client";

export async function getOrCreateProfile(
  userId: string,
  email: string,
  meta?: Record<string, unknown> | null,
) {
  const m = (meta ?? {}) as Record<string, string | undefined>;
  const fullName  = m.full_name  ?? m.name  ?? null;
  const avatarUrl = m.avatar_url ?? null;
  const role      = m.role === "PROVIDER" ? "PROVIDER" : "PARENT";

  // First, try to find by supabaseId (fast path)
  const existing = await prisma.profile.findUnique({
    where: { supabaseId: userId },
  });

  if (existing) {
    return prisma.profile.update({
      where: { supabaseId: userId },
      data: {
        ...(fullName  ? { fullName }  : {}),
        ...(avatarUrl ? { avatarUrl } : {}),
        updatedAt: new Date(),
      },
    });
  }

  // No profile for this supabaseId — check if one exists with the same email
  // (e.g. user signed up with email/password, now logging in via Google, or vice versa)
  const emailNormalized = (email || "").toLowerCase();
  if (emailNormalized) {
    const byEmail = await prisma.profile.findUnique({
      where: { email: emailNormalized },
    });

    if (byEmail) {
      // Link existing email-based profile to this supabase user
      return prisma.profile.update({
        where: { id: byEmail.id },
        data: {
          supabaseId: userId,
          ...(fullName  ? { fullName }  : {}),
          ...(avatarUrl ? { avatarUrl } : {}),
          updatedAt: new Date(),
        },
      });
    }
  }

  // No profile at all — create a new one
  const profile = await prisma.profile.create({
    data: {
      supabaseId: userId,
      email:      emailNormalized || "",
      fullName,
      avatarUrl,
      role,
    },
  });

  // Persist children from registration metadata (parent flow)
  const rawChildren = meta?.children;
  if (role === "PARENT" && Array.isArray(rawChildren)) {
    for (const child of rawChildren) {
      const c = child as Record<string, string | undefined>;
      if (c.firstName?.trim()) {
        await prisma.child.create({
          data: {
            parentId: profile.id,
            firstName: c.firstName.trim(),
            lastName: c.lastName?.trim() || null,
            dateOfBirth: new Date(c.dateOfBirth ?? ""),
          },
        }).catch(console.error);
      }
    }
  }

  // Persist provider profile from registration metadata (provider flow)
  const companyName = typeof m.company_name === "string" ? m.company_name.trim() : "";
  if (role === "PROVIDER" && companyName) {
    await prisma.providerProfile.create({
      data: {
        profileId: profile.id,
        businessName: companyName,
        city: typeof m.city === "string" ? m.city.trim() || null : null,
        phone: typeof m.phone === "string" ? m.phone.trim() || null : null,
        isClaimed: true,
      },
    }).catch(console.error);
  }

  return profile;
}
