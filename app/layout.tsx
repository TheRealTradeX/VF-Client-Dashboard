import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

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
          "min-h-screen bg-background text-foreground antialiased overflow-x-hidden",
          fontSans.variable,
        )}
      >
        <div className="min-h-screen flex bg-black overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden bg-black min-w-0">
            <Topbar />
            <main className="flex-1 overflow-y-auto bg-black min-w-0">
              <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_35%)] min-w-0">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
