import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PWARegister } from "@/components/PWARegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HabiXa - Habit Tracker",
  description: "A premium habit tracking application",
  manifest: "/manifest.json",
  themeColor: "#4F6BED",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HabiXa",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-[#F8F9FA] dark:bg-[#0a0a0a] font-[family-name:var(--font-inter)]">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
