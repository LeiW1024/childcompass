// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { LangProvider } from "@/components/ui/LanguageSwitcher";

export const metadata: Metadata = {
  title: { default: "ChildCompass", template: "%s | ChildCompass" },
  description: "Discover trusted childcare activities for your child — ages 0 to 6.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LangProvider>
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
