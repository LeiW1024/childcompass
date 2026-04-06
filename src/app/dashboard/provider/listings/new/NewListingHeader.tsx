"use client";
import { useLang, t } from "@/components/ui/LanguageSwitcher";

export default function NewListingHeader() {
  const { lang } = useLang();
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-extrabold">{t("createNewListing", lang)}</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {t("createListingSub", lang)}
      </p>
    </div>
  );
}
