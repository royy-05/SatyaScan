import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { APP_ROUTES } from "../../routes/config";
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  ShieldAlert,
  History,
  Users,
  Activity,
  BarChart3,
  User,
  Shield,
} from "lucide-react";
import { cn } from "../../lib/utils";

const ICON_MAP = {
  LayoutDashboard,
  UploadCloud,
  FileText,
  ShieldAlert,
  History,
  Users,
  Activity,
  BarChart3,
  User,
};

export function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const allowedRoutes = APP_ROUTES.filter(
    (route) => route.inSidebar && route.roles.includes(user.role)
  );

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-xl flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-900/30">
          <Shield className="h-6 w-6 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-slate-100 tracking-tight flex items-center gap-1.5">
            Satya<span className="text-cyan-400">Scan</span>
          </h1>
          <p className="text-[11px] font-medium text-slate-400">Border Verification</p>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </div>
        {allowedRoutes.map((route) => {
          const IconComponent = ICON_MAP[route.icon] || FileText;
          return (
            <NavLink
              key={route.path}
              to={route.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold shadow-sm"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                )
              }
            >
              <IconComponent className="h-4 w-4 shrink-0" />
              <span>{route.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Border Station Footer Badge */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 m-3 rounded-lg border">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-slate-300">SSB Border Security Checkpoint</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">System v1.0.0 Enterprise</p>
      </div>
    </aside>
  );
}
