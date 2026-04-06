// app/dashboard/provider/setup/page.tsx
import { createClient } from "@/lib/supabase/server";
import { profileRepo } from "@/lib/prisma/repositories";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import SetupWizard from "./SetupWizard";

export default async function ProviderSetupPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const profile = await profileRepo.findBySupabaseId(user.id);
  if (!profile) redirect("/auth/login");
  if (profile.role !== "PROVIDER") redirect("/dashboard/parent");

  const provider = profile.provider;
  if (!provider) redirect("/auth/login");

  // If provider already has description + address, setup is complete
  if (provider.description && provider.address) {
    redirect("/dashboard/provider");
  }

  // Serialize Prisma object before passing to client component
  const serializedProvider = JSON.parse(JSON.stringify(provider));

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <SetupWizard provider={serializedProvider} />
    </div>
  );
}
