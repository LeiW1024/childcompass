"use client";
// components/layout/NavbarClient.tsx
import Link from "next/link";
import { useLang, t } from "@/components/ui/LanguageSwitcher";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import SignOutButton from "@/components/ui/SignOutButton";

interface Props {
  user: boolean;
  dashHref: string;
  avatarUrl?: string | null;
  fullName?: string | null;
}

export default function NavbarClient({ user, dashHref, fullName }: Props) {
  const { lang } = useLang();
  const firstName = fullName?.split(" ")[0] ?? (lang === "de" ? "Mein Konto" : "My Account");

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4 relative">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <span className="text-xl">🧭</span>
          <span className="font-extrabold text-lg text-foreground group-hover:text-primary transition-colors">
            ChildCompass
          </span>
        </Link>

        {/* Nav links — centered */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-muted-foreground absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/listings" className="hover:text-foreground transition-colors">
            {t("explore", lang)}
          </Link>
          {!user && (
            <Link href="/auth/register?role=PROVIDER" className="hover:text-foreground transition-colors">
              {t("forProviders", lang)}
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitcher />
          {user ? (
            <>
              <Link
                href={dashHref}
                className="hidden sm:inline-flex items-center gap-1.5 bg-primary/8 hover:bg-primary/15 text-primary font-bold text-sm px-4 py-2 rounded-xl transition-all"
              >
                👋 {firstName}
              </Link>
              <SignOutButton
                label={t("signOut", lang)}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted"
              />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted"
              >
                {t("signIn", lang)}
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
              >
                {t("getStarted", lang)}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
