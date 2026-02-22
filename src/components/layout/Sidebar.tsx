import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Clients", icon: Users, path: "/clients" },
  { label: "Plans & Billing", icon: CreditCard, path: "/plans" },
  { label: "System Health", icon: Activity, path: "/health" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth0();

  return (
    <aside
      className={cn(
        "h-screen bg-slate-900 text-white flex flex-col transition-all duration-300 sticky top-0",
        collapsed ? "w-[68px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-slate-700/50">
        <Shield className="h-7 w-7 text-blue-400 flex-shrink-0" />
        {!collapsed && (
          <div>
            <span className="text-lg font-bold tracking-tight">NOBIS</span>
            <span className="text-[10px] ml-1 text-blue-400 font-medium">ADMIN</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )
            }
          >
            <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-2 mb-2 flex items-center justify-center h-9 rounded-lg hover:bg-slate-800 text-slate-400"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Logout */}
      <div className="border-t border-slate-700/50 px-2 py-3">
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white w-full"
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
