import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex bg-black overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-black min-w-0 h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-black min-w-0">
          <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_35%)] min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
