// app/dashboard/page.tsx — smart redirect
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/prisma/getOrCreateProfile";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const profile = await getOrCreateProfile(user.id, user.email ?? "", user.user_metadata);
  if (profile.role === "PROVIDER") redirect("/dashboard/provider");
  redirect("/dashboard/parent");
}
