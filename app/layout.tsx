import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VF Client Dashboard",
  description: "Dark baseline dashboard scaffold for VF clients.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen bg-background text-foreground antialiased overflow-x-hidden font-sans",
          fontSans.variable,
        )}
      >
        {children}
      </body>
    </html>
  );
}
