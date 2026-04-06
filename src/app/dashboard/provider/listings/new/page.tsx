// app/dashboard/provider/listings/new/page.tsx
import { createClient } from "@/lib/supabase/server";
import { profileRepo } from "@/lib/prisma/repositories";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import NewListingForm from "./NewListingForm";
import NewListingHeader from "./NewListingHeader";

export default async function NewListingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const profile = await profileRepo.findBySupabaseId(user.id);
  if (!profile || profile.role !== "PROVIDER") redirect("/dashboard/parent");
  if (!profile.provider) redirect("/dashboard/provider/setup");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <NewListingHeader />
        <NewListingForm />
      </div>
    </div>
  );
}
