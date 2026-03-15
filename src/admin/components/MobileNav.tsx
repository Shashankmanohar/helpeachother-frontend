import { NavLink } from "@admin/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, ArrowDownToLine, Receipt,
  MoreHorizontal, Layers, Key, Heart, ScrollText,
  Settings, Shield, CreditCard, LogOut
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const primaryTabs = [
  { title: "Home", url: "/", icon: LayoutDashboard },
  { title: "Users", url: "/users", icon: Users },
  { title: "KYC", url: "/kyc", icon: CreditCard },
  { title: "Txns", url: "/transactions", icon: Receipt },
  { title: "More", url: "#more", icon: MoreHorizontal },
];

const moreItems = [
  { title: "Withdrawals", url: "/withdrawals", icon: ArrowDownToLine },
  { title: "Autopool", url: "/autopool", icon: Layers },
  { title: "Pins", url: "/pins", icon: Key },
  { title: "Marriage Help", url: "/marriage-help", icon: Heart },
  { title: "Audit Logs", url: "/audit-logs", icon: ScrollText },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function MobileNav() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('heo_admin_token');
    localStorage.removeItem('heo_admin_user');
    window.location.href = '/adminlogin';
  };
  const isMoreActive = moreItems.some((item) => location.pathname === item.url);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-1">
          {primaryTabs.map((item) => {
            if (item.url === "#more") {
              return (
                <button key="more" onClick={() => setMoreOpen(true)} className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-medium transition-all ${isMoreActive ? "text-foreground" : "text-muted-foreground"}`}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${isMoreActive ? "bg-primary/15" : ""}`}>
                    <item.icon className="h-[18px] w-[18px]" />
                  </div>
                  <span>{item.title}</span>
                </button>
              );
            }
            const isActive = location.pathname === item.url;
            return (
              <NavLink key={item.url} to={item.url} end={item.url === "/"} className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-medium transition-all ${isActive ? "text-foreground" : "text-muted-foreground"}`} activeClassName="">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${isActive ? "bg-primary/15" : ""}`}>
                  <item.icon className="h-[18px] w-[18px]" />
                </div>
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl border-border bg-card px-4 pb-8">
          <SheetHeader className="pb-2">
            <SheetTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5 text-primary" />
              More Options
            </SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-3">
            {moreItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <NavLink key={item.url} to={item.url} onClick={() => setMoreOpen(false)} className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${isActive ? "border-primary/30 bg-primary/10 text-foreground" : "border-border bg-secondary/50 text-muted-foreground hover:border-border hover:bg-secondary"}`} activeClassName="">
                  <div className={`rounded-xl p-2.5 ${isActive ? "bg-primary/20" : "bg-muted"}`}>
                    <item.icon className={`h-5 w-5 ${isActive ? "text-foreground" : ""}`} />
                  </div>
                  <span className="text-xs font-medium">{item.title}</span>
                </NavLink>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive p-4 transition-all hover:bg-destructive/10"
            >
              <div className="rounded-xl p-2.5 bg-destructive/10">
                <LogOut className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">Logout</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
