// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/components/ui/LanguageSwitcher";
import ChatWidget from "@/components/chat/ChatWidget";

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
          <ChatWidget />
        </LangProvider>
      </body>
    </html>
  );
}
