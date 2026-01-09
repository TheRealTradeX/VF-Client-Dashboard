import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  return (
    <div className="h-screen flex bg-black overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col bg-black min-w-0 h-screen overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto bg-black min-w-0">
          <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_40%)] min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
