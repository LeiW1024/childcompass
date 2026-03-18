// app/dashboard/parent/page.tsx
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { getOrCreateProfile } from "@/lib/prisma/getOrCreateProfile";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ParentDashboardClient from "./ParentDashboardClient";

export default async function ParentDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // getOrCreateProfile always returns a stable profile.id for this supabaseId
  const baseProfile = await getOrCreateProfile(user.id, user.email ?? "", user.user_metadata);
  if (baseProfile.role === "PROVIDER") redirect("/dashboard/provider");

  // Fetch children separately to keep getOrCreateProfile lean
  const children = await prisma.child.findMany({
    where: { parentId: baseProfile.id },
    orderBy: { firstName: "asc" },
  });

  const bookings = await prisma.booking.findMany({
    where: { parentId: baseProfile.id },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: {
          providerProfile: {
            select: { businessName: true, phone: true, website: true, city: true, isClaimed: true },
          },
        },
      },
      child: true,
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParentDashboardClient
        profile={JSON.parse(JSON.stringify(baseProfile))}
        initialChildren={JSON.parse(JSON.stringify(children))}
        initialBookings={JSON.parse(JSON.stringify(bookings))}
      />
    </div>
  );
}
