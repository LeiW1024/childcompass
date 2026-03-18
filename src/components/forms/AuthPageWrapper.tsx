"use client";
// components/forms/AuthPageWrapper.tsx
// Client wrapper so auth pages can access lang context for translations
import { Suspense } from "react";
import Link from "next/link";
import { useLang } from "@/components/ui/LanguageSwitcher";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface Props {
  page: "login" | "register";
  defaultRole?: string;
}

const TEXT = {
  login: {
    title:    { de: "Willkommen zurück",                   en: "Welcome back" },
    sub:      { de: "Melde dich bei deinem Konto an",      en: "Sign in to your ChildCompass account" },
    noAcct:   { de: "Noch kein Konto?",                    en: "Don't have an account?" },
    create:   { de: "Jetzt registrieren",                  en: "Create one" },
  },
  register: {
    title:    { de: "Konto erstellen",                     en: "Create an account" },
    sub:      { de: "In wenigen Minuten loslegen",         en: "It only takes a few minutes to get started" },
    hasAcct:  { de: "Bereits ein Konto?",                  en: "Already have an account?" },
    signIn:   { de: "Anmelden",                            en: "Sign in" },
  },
};

export default function AuthPageWrapper({ page, defaultRole = "PARENT" }: Props) {
  const { lang } = useLang();
  const de = lang === "de";

  if (page === "login") {
    const tx = TEXT.login;
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{de ? tx.title.de : tx.title.en}</h1>
          <p className="text-base text-muted-foreground mt-2">{de ? tx.sub.de : tx.sub.en}</p>
        </div>
        <Suspense><LoginForm /></Suspense>
        <p className="text-sm text-muted-foreground text-center pt-2">
          {de ? tx.noAcct.de : tx.noAcct.en}{" "}
          <a href="/auth/register" className="text-primary font-bold hover:underline">
            {de ? tx.create.de : tx.create.en}
          </a>
        </p>
      </div>
    );
  }

  const tx = TEXT.register;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{de ? tx.title.de : tx.title.en}</h1>
        <p className="text-base text-muted-foreground mt-2">{de ? tx.sub.de : tx.sub.en}</p>
      </div>
      <RegisterForm defaultRole={defaultRole} />
      <p className="text-sm text-muted-foreground text-center pt-2">
        {de ? tx.hasAcct.de : tx.hasAcct.en}{" "}
        <a href="/auth/login" className="text-primary font-bold hover:underline">
          {de ? tx.signIn.de : tx.signIn.en}
        </a>
      </p>
    </div>
  );
}
