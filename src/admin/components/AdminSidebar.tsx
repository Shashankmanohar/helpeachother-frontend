import { NavLink } from "@admin/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, ArrowDownToLine, Layers, Key,
  Settings, Heart, Receipt, ScrollText, Shield, ChevronLeft,
  ChevronRight, CreditCard, Banknote,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "KYC", url: "/admin/kyc", icon: CreditCard },
  { title: "Payment Approvals", url: "/admin/payment-approvals", icon: Banknote },
  { title: "Withdrawals", url: "/admin/withdrawals", icon: ArrowDownToLine },
  { title: "Autopool", url: "/admin/autopool", icon: Layers },
  { title: "Pins", url: "/admin/pins", icon: Key },
  { title: "Transactions", url: "/admin/transactions", icon: Receipt },
  { title: "Marriage Help", url: "/admin/marriage-help", icon: Heart },
  { title: "Audit Logs", url: "/admin/audit-logs", icon: ScrollText },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];


export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={`fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-sm font-bold tracking-tight text-foreground">ADMIN PANEL</span>
          </div>
        )}
        {collapsed && <Shield className="mx-auto h-7 w-7 text-primary" />}
        <button onClick={() => setCollapsed(!collapsed)} className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      <nav className="mt-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <NavLink key={item.url} to={item.url} end={item.url === "/"} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150 ${isActive ? "bg-primary/10 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`} activeClassName="">
              <item.icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>
      {!collapsed && (
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="rounded-md bg-secondary p-3">
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="text-sm font-medium text-foreground">Super Admin</p>
          </div>
        </div>
      )}
    </aside>
  );
}
