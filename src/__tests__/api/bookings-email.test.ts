/**
 * @jest-environment node
 *
 * bookings-email.test.ts
 *
 * TDD tests verifying that email notifications are sent (or not sent) at the
 * correct points in the booking workflow.
 *
 * Strategy:
 *  - Mock `src/lib/email` entirely so no real HTTP calls are made.
 *  - Mock `@/lib/supabase/server`, `@/lib/prisma/getOrCreateProfile`, and
 *    `@/lib/prisma/client` to keep tests isolated from the database.
 */

// ─── Email module mock ────────────────────────────────────────────────────────
jest.mock("@/lib/email", () => ({
  sendBookingRequestEmail: jest.fn().mockResolvedValue(undefined),
  sendBookingConfirmedEmail: jest.fn().mockResolvedValue(undefined),
  sendBookingDeclinedEmail: jest.fn().mockResolvedValue(undefined),
  sendBookingCancelledEmail: jest.fn().mockResolvedValue(undefined),
}));

import * as emailModule from "@/lib/email";

// ─── Supabase server client mock ──────────────────────────────────────────────
const mockGetUser = jest.fn();
jest.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}));

// ─── getOrCreateProfile mock ──────────────────────────────────────────────────
const mockProfile = {
  id: "profile-parent-1",
  email: "parent@test.com",
  fullName: "Test Parent",
  role: "PARENT",
};

jest.mock("@/lib/prisma/getOrCreateProfile", () => ({
  getOrCreateProfile: jest.fn().mockResolvedValue(mockProfile),
}));

// ─── Prisma client mock ───────────────────────────────────────────────────────
const mockPrismaBookingCreate = jest.fn();
const mockPrismaBookingFindUnique = jest.fn();
const mockPrismaBookingUpdate = jest.fn();
const mockPrismaListingFindUnique = jest.fn();
const mockPrismaChildFindFirst = jest.fn();
const mockPrismaProviderProfileFindUnique = jest.fn();

jest.mock("@/lib/prisma/client", () => ({
  prisma: {
    booking: {
      create: (...args: unknown[]) => mockPrismaBookingCreate(...args),
      findUnique: (...args: unknown[]) => mockPrismaBookingFindUnique(...args),
      update: (...args: unknown[]) => mockPrismaBookingUpdate(...args),
    },
    listing: {
      findUnique: (...args: unknown[]) => mockPrismaListingFindUnique(...args),
    },
    child: {
      findFirst: (...args: unknown[]) => mockPrismaChildFindFirst(...args),
    },
    providerProfile: {
      findUnique: (...args: unknown[]) => mockPrismaProviderProfileFindUnique(...args),
    },
  },
}));

// ─── Route handlers (imported AFTER mocks) ───────────────────────────────────
import { POST } from "@/app/api/bookings/route";
import { PATCH } from "@/app/api/bookings/[id]/route";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makePatchRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/bookings/booking-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// Seed data used across tests
const mockListing = {
  id: "listing-1",
  title: "Malerei für Kinder",
  isPublished: true,
  providerProfileId: "provider-profile-1",
};

const mockChild = {
  id: "child-1",
  firstName: "Emma",
  parentId: "profile-parent-1",
};

const mockCreatedBooking = {
  id: "booking-1",
  listingId: "listing-1",
  parentId: "profile-parent-1",
  childId: "child-1",
  status: "REQUESTED",
  message: "Hallo!",
};

// Provider profile with nested profile (email) relation
const mockProviderProfile = {
  id: "provider-profile-1",
  businessName: "Kunstwerkstatt Erfurt",
  profile: {
    email: "provider@test.com",
    fullName: "Kunst Anbieter",
  },
};

// Full booking returned from the PATCH findUnique (for status updates)
const mockBookingWithRelations = {
  id: "booking-1",
  status: "REQUESTED",
  listing: {
    id: "listing-1",
    title: "Malerei für Kinder",
    providerProfileId: "provider-profile-1",
    providerProfile: {
      id: "provider-profile-1",
      businessName: "Kunstwerkstatt Erfurt",
      profile: {
        email: "provider@test.com",
        fullName: "Kunst Anbieter",
      },
    },
  },
  parent: {
    id: "profile-parent-1",
    email: "parent@test.com",
    fullName: "Test Parent",
  },
  child: {
    id: "child-1",
    firstName: "Emma",
  },
};

// ─── POST /api/bookings ───────────────────────────────────────────────────────

describe("POST /api/bookings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: authenticated parent
    mockGetUser.mockResolvedValue({
      data: { user: { id: "supabase-uid-1", email: "parent@test.com", user_metadata: {} } },
      error: null,
    });
    mockPrismaListingFindUnique.mockResolvedValue(mockListing);
    mockPrismaChildFindFirst.mockResolvedValue(mockChild);
    mockPrismaBookingCreate.mockResolvedValue(mockCreatedBooking);
    // The route fetches providerProfile (with profile.email) after creating the booking
    mockPrismaProviderProfileFindUnique.mockResolvedValue(mockProviderProfile);
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await POST(makeRequest({ listingId: "listing-1", childId: "child-1" }));

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toMatchObject({ data: null, error: "Unauthorized" });
  });

  it("calls sendBookingRequestEmail when booking is created successfully", async () => {
    const res = await POST(
      makeRequest({ listingId: "listing-1", childId: "child-1", message: "Hallo!" })
    );

    expect(res.status).toBe(201);
    // Allow fire-and-forget: wait a tick so the floating promise can resolve
    await Promise.resolve();

    expect(emailModule.sendBookingRequestEmail).toHaveBeenCalledTimes(1);
    expect(emailModule.sendBookingRequestEmail).toHaveBeenCalledWith(
      "provider@test.com",
      expect.objectContaining({
        listingTitle: mockListing.title,
        childName: mockChild.firstName,
        parentName: mockProfile.fullName,
        providerName: mockProviderProfile.businessName,
      })
    );
  });

  it("does NOT call sendBookingRequestEmail when listing is not found", async () => {
    mockPrismaListingFindUnique.mockResolvedValue(null);

    const res = await POST(makeRequest({ listingId: "bad-id", childId: "child-1" }));

    expect(res.status).toBe(404);
    await Promise.resolve();
    expect(emailModule.sendBookingRequestEmail).not.toHaveBeenCalled();
  });

  it("does NOT call sendBookingRequestEmail when booking creation fails", async () => {
    mockPrismaBookingCreate.mockRejectedValue(new Error("DB error"));

    const res = await POST(
      makeRequest({ listingId: "listing-1", childId: "child-1" })
    );

    expect(res.status).toBe(500);
    await Promise.resolve();
    expect(emailModule.sendBookingRequestEmail).not.toHaveBeenCalled();
  });

  it("returns { data, error } shape on success", async () => {
    const res = await POST(makeRequest({ listingId: "listing-1", childId: "child-1" }));
    const body = await res.json();
    expect(body).toHaveProperty("data");
    expect(body).toHaveProperty("error");
  });
});

// ─── PATCH /api/bookings/[id] ─────────────────────────────────────────────────

describe("PATCH /api/bookings/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper: set up as authenticated provider who owns the listing
  function setupAsProvider() {
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: "supabase-uid-provider", email: "provider@test.com", user_metadata: {} },
      },
      error: null,
    });
    // getOrCreateProfile returns provider profile
    const { getOrCreateProfile } = require("@/lib/prisma/getOrCreateProfile");
    (getOrCreateProfile as jest.Mock).mockResolvedValue({
      id: "profile-provider-1",
      email: "provider@test.com",
      fullName: "Kunst Anbieter",
      role: "PROVIDER",
    });
    // The booking lookup includes relations
    mockPrismaBookingFindUnique.mockResolvedValue(mockBookingWithRelations);
    // Provider owns the listing
    mockPrismaProviderProfileFindUnique.mockResolvedValue({
      id: "provider-profile-1",
    });
  }

  // Helper: set up as authenticated parent who owns the booking
  function setupAsParent() {
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: "supabase-uid-parent", email: "parent@test.com", user_metadata: {} },
      },
      error: null,
    });
    const { getOrCreateProfile } = require("@/lib/prisma/getOrCreateProfile");
    (getOrCreateProfile as jest.Mock).mockResolvedValue(mockProfile);
    mockPrismaBookingFindUnique.mockResolvedValue(mockBookingWithRelations);
  }

  it("calls sendBookingConfirmedEmail when status is set to CONFIRMED", async () => {
    setupAsProvider();
    mockPrismaBookingUpdate.mockResolvedValue({ ...mockCreatedBooking, status: "CONFIRMED" });

    const res = await PATCH(makePatchRequest({ status: "CONFIRMED" }), {
      params: { id: "booking-1" },
    });

    expect(res.status).toBe(200);
    await Promise.resolve();

    expect(emailModule.sendBookingConfirmedEmail).toHaveBeenCalledTimes(1);
    expect(emailModule.sendBookingConfirmedEmail).toHaveBeenCalledWith(
      "parent@test.com",
      expect.objectContaining({
        parentName: "Test Parent",
        childName: "Emma",
        listingTitle: "Malerei für Kinder",
        providerName: "Kunstwerkstatt Erfurt",
      })
    );
    expect(emailModule.sendBookingDeclinedEmail).not.toHaveBeenCalled();
    expect(emailModule.sendBookingCancelledEmail).not.toHaveBeenCalled();
  });

  it("calls sendBookingDeclinedEmail when status is set to DECLINED", async () => {
    setupAsProvider();
    mockPrismaBookingUpdate.mockResolvedValue({ ...mockCreatedBooking, status: "DECLINED" });

    const res = await PATCH(makePatchRequest({ status: "DECLINED" }), {
      params: { id: "booking-1" },
    });

    expect(res.status).toBe(200);
    await Promise.resolve();

    expect(emailModule.sendBookingDeclinedEmail).toHaveBeenCalledTimes(1);
    expect(emailModule.sendBookingDeclinedEmail).toHaveBeenCalledWith(
      "parent@test.com",
      expect.objectContaining({
        parentName: "Test Parent",
        childName: "Emma",
        listingTitle: "Malerei für Kinder",
        providerName: "Kunstwerkstatt Erfurt",
      })
    );
    expect(emailModule.sendBookingConfirmedEmail).not.toHaveBeenCalled();
    expect(emailModule.sendBookingCancelledEmail).not.toHaveBeenCalled();
  });

  it("calls sendBookingCancelledEmail to provider when status is set to CANCELLED", async () => {
    setupAsParent();
    mockPrismaBookingUpdate.mockResolvedValue({ ...mockCreatedBooking, status: "CANCELLED" });

    const res = await PATCH(makePatchRequest({ status: "CANCELLED" }), {
      params: { id: "booking-1" },
    });

    expect(res.status).toBe(200);
    await Promise.resolve();

    expect(emailModule.sendBookingCancelledEmail).toHaveBeenCalledTimes(1);
    expect(emailModule.sendBookingCancelledEmail).toHaveBeenCalledWith(
      "provider@test.com",
      expect.objectContaining({
        parentName: "Test Parent",
        childName: "Emma",
        listingTitle: "Malerei für Kinder",
        providerName: "Kunstwerkstatt Erfurt",
      })
    );
    expect(emailModule.sendBookingConfirmedEmail).not.toHaveBeenCalled();
    expect(emailModule.sendBookingDeclinedEmail).not.toHaveBeenCalled();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await PATCH(makePatchRequest({ status: "CONFIRMED" }), {
      params: { id: "booking-1" },
    });

    expect(res.status).toBe(401);
    await Promise.resolve();
    expect(emailModule.sendBookingConfirmedEmail).not.toHaveBeenCalled();
  });
});
