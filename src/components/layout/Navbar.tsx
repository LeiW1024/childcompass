// components/layout/Navbar.tsx — server component shell
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/prisma/getOrCreateProfile";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role: string | null = null;
  let fullName: string | null = null;

  if (user) {
    const profile = await getOrCreateProfile(
      user.id,
      user.email ?? "",
      user.user_metadata,
    ).catch(() => null);

    role     = profile?.role     ?? null;
    fullName = profile?.fullName ?? user.user_metadata?.full_name ?? null;
  }

  const dashHref = role === "PROVIDER" ? "/dashboard/provider" : "/dashboard/parent";

  return (
    <NavbarClient
      user={!!user}
      dashHref={dashHref}
      fullName={fullName}
    />
  );
}
