import { AdminSidebar } from "@admin/components/AdminSidebar";
import { AdminHeader } from "@admin/components/AdminHeader";
import { MobileNav } from "@admin/components/MobileNav";
import { Outlet } from "react-router-dom";
import { useIsMobile } from "@admin/hooks/use-mobile";

export function AdminLayout() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <AdminSidebar />}
      <div className={`transition-all duration-300 ${isMobile ? "ml-0 pb-20" : "ml-60"}`}>
        <AdminHeader />
        <main className={`${isMobile ? "p-4" : "p-6"}`}>
          <Outlet />
        </main>
      </div>
      {isMobile && <MobileNav />}
    </div>
  );
}
