// lib/prisma/repositories.ts — MVP repository helpers

import { prisma } from "./client";
import type { Prisma, BookingStatus, ListingCategory } from "@prisma/client";

// ─── Profile ─────────────────────────────────

export const profileRepo = {
  findBySupabaseId: (supabaseId: string) =>
    prisma.profile.findUnique({
      where: { supabaseId },
      include: { provider: true },
    }),

  upsert: (data: Prisma.ProfileCreateInput) =>
    prisma.profile.upsert({
      where: { supabaseId: data.supabaseId },
      create: data,
      update: { fullName: data.fullName, avatarUrl: data.avatarUrl },
    }),
};

// ─── Provider Profile ─────────────────────────

export const providerRepo = {
  findByProfileId: (profileId: string) =>
    prisma.providerProfile.findUnique({
      where: { profileId },
      include: { listings: { orderBy: { createdAt: "desc" } } },
    }),

  create: (data: Prisma.ProviderProfileCreateInput) =>
    prisma.providerProfile.create({ data }),

  findById: (id: string) =>
    prisma.providerProfile.findUnique({
      where: { id },
      include: { listings: { orderBy: { createdAt: "desc" } } },
    }),

  update: (id: string, data: Prisma.ProviderProfileUpdateInput) =>
    prisma.providerProfile.update({ where: { id }, data }),

  delete: (id: string) =>
    prisma.providerProfile.delete({ where: { id } }),
};

// ─── Listings ─────────────────────────────────

export const listingRepo = {
  // Public: published listings with optional filters
  findPublished: (opts?: {
    category?: ListingCategory;
    ageMonths?: number;
    city?: string;
    take?: number;
    skip?: number;
  }) =>
    prisma.listing.findMany({
      where: {
        isPublished: true,
        ...(opts?.category ? { category: opts.category } : {}),
        ...(opts?.ageMonths != null
          ? { ageMinMonths: { lte: opts.ageMonths }, ageMaxMonths: { gte: opts.ageMonths } }
          : {}),
        ...(opts?.city ? { city: { contains: opts.city, mode: "insensitive" } } : {}),
      },
      include: { providerProfile: { select: { businessName: true, logoUrl: true, city: true } } },
      orderBy: { createdAt: "desc" },
      take: opts?.take ?? 20,
      skip: opts?.skip ?? 0,
    }),

  findById: (id: string) =>
    prisma.listing.findUnique({
      where: { id },
      include: { providerProfile: true },
    }),

  // Provider: all listings for their profile
  findByProvider: (providerProfileId: string) =>
    prisma.listing.findMany({
      where: { providerProfileId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { bookings: true } } },
    }),

  create: (data: Prisma.ListingCreateInput) => prisma.listing.create({ data }),

  update: (id: string, data: Prisma.ListingUpdateInput) =>
    prisma.listing.update({ where: { id }, data }),

  delete: (id: string) => prisma.listing.delete({ where: { id } }),

  togglePublish: (id: string, isPublished: boolean) =>
    prisma.listing.update({ where: { id }, data: { isPublished } }),
};

// ─── Bookings ─────────────────────────────────

export const bookingRepo = {
  // Parent: all bookings they made
  findByParent: (parentId: string) =>
    prisma.booking.findMany({
      where: { parentId },
      orderBy: { createdAt: "desc" },
      include: {
        listing: { include: { providerProfile: { select: { businessName: true } } } },
        child: true,
      },
    }),

  // Provider: all bookings for their listings
  findByProviderListings: (providerProfileId: string) =>
    prisma.booking.findMany({
      where: { listing: { providerProfileId } },
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { id: true, title: true } },
        child: true,
        parent: { select: { fullName: true, email: true } },
      },
    }),

  findById: (id: string) =>
    prisma.booking.findUnique({
      where: { id },
      include: { listing: true, child: true, parent: true },
    }),

  create: (data: Prisma.BookingCreateInput) => prisma.booking.create({ data }),

  updateStatus: (id: string, status: BookingStatus) =>
    prisma.booking.update({
      where: { id },
      data: { status, respondedAt: new Date() },
    }),
};

// ─── Children ─────────────────────────────────

export const childRepo = {
  findByParent: (parentId: string) =>
    prisma.child.findMany({ where: { parentId }, orderBy: { firstName: "asc" } }),

  create: (data: Prisma.ChildCreateInput) => prisma.child.create({ data }),
  delete: (id: string) => prisma.child.delete({ where: { id } }),
};
