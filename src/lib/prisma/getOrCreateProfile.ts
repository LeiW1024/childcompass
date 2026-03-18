// lib/prisma/getOrCreateProfile.ts
// Shared helper: always returns a valid Profile row for a Supabase user.
// Safe for Google OAuth users who may not have a DB row yet.
// The update clause always sets updatedAt to avoid Prisma empty-update errors.

import { prisma } from "./client";

export async function getOrCreateProfile(
  userId: string,
  email: string,
  meta?: Record<string, any> | null,
) {
  const fullName  = meta?.full_name  ?? meta?.name  ?? null;
  const avatarUrl = meta?.avatar_url ?? null;

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
  return prisma.profile.create({
    data: {
      supabaseId: userId,
      email:      emailNormalized || "",
      fullName,
      avatarUrl,
      role: "PARENT",
    },
  });
}
