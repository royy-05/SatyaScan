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
  FileCheck2,
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
  FileCheck2,
};

export function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const allowedRoutes = APP_ROUTES.filter(
    (route) => route.inSidebar && route.roles.includes(user.role)
  );

  // Group routes into sections
  const mainRoutes = allowedRoutes.filter((r) =>
    ["/app/dashboard", "/app/submit", "/app/submissions"].includes(r.path)
  );
  const opsRoutes = allowedRoutes.filter((r) =>
    ["/app/reviews/queue", "/app/reviews/mine"].includes(r.path)
  );
  const systemRoutes = allowedRoutes.filter((r) =>
    ["/app/admin/users", "/app/admin/audit", "/app/admin/stats"].includes(r.path)
  );

  return (
    <aside className="w-64 shrink-0 bg-[#283733] text-[#FDF6F0] border-r border-[#475853] flex flex-col h-screen sticky top-0 shadow-md">
      {/* Official Brand Header */}
      <div className="p-5 border-b border-[#475853] flex items-center space-x-3 bg-[#1e2a27]">
        <div className="h-9 w-9 rounded bg-[#DBCEB1] flex items-center justify-center text-[#283733] shadow-sm">
          <Shield className="h-5 w-5 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-extrabold text-base text-[#FDF6F0] tracking-wider uppercase flex items-center gap-1">
            Satya<span className="text-[#DBCEB1]">Scan</span>
          </h1>
          <p className="text-[10px] font-semibold tracking-wider text-[#DBCEB1] uppercase">
            Border Security & Forensics
          </p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
        {/* Main Section */}
        {mainRoutes.length > 0 && (
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#DBCEB1]/70">
              Main Workstation
            </div>
            {mainRoutes.map((route) => {
              const IconComponent = ICON_MAP[route.icon] || FileText;
              return (
                <NavLink
                  key={route.path}
                  to={route.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-colors",
                      isActive
                        ? "bg-[#475853] text-[#DBCEB1] border-l-4 border-[#DBCEB1] font-bold"
                        : "text-[#FDF6F0]/80 hover:bg-[#475853]/50 hover:text-[#FDF6F0]"
                    )
                  }
                >
                  <IconComponent className="h-4 w-4 shrink-0 text-[#DBCEB1]" />
                  <span>{route.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}

        {/* Operations Section */}
        {opsRoutes.length > 0 && (
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#DBCEB1]/70">
              Operations & Review
            </div>
            {opsRoutes.map((route) => {
              const IconComponent = ICON_MAP[route.icon] || ShieldAlert;
              return (
                <NavLink
                  key={route.path}
                  to={route.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-colors",
                      isActive
                        ? "bg-[#475853] text-[#DBCEB1] border-l-4 border-[#DBCEB1] font-bold"
                        : "text-[#FDF6F0]/80 hover:bg-[#475853]/50 hover:text-[#FDF6F0]"
                    )
                  }
                >
                  <IconComponent className="h-4 w-4 shrink-0 text-[#DBCEB1]" />
                  <span>{route.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}

        {/* System Administration Section */}
        {systemRoutes.length > 0 && (
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#DBCEB1]/70">
              Intelligence & Admin
            </div>
            {systemRoutes.map((route) => {
              const IconComponent = ICON_MAP[route.icon] || Activity;
              return (
                <NavLink
                  key={route.path}
                  to={route.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-colors",
                      isActive
                        ? "bg-[#475853] text-[#DBCEB1] border-l-4 border-[#DBCEB1] font-bold"
                        : "text-[#FDF6F0]/80 hover:bg-[#475853]/50 hover:text-[#FDF6F0]"
                    )
                  }
                >
                  <IconComponent className="h-4 w-4 shrink-0 text-[#DBCEB1]" />
                  <span>{route.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>

      {/* Border Station Footer Badge */}
      <div className="p-3 border-t border-[#475853] bg-[#1e2a27] text-xs">
        <div className="flex items-center space-x-2 text-[#FDF6F0]">
          <div className="h-2 w-2 rounded-full bg-[#2F7D5A]" />
          <span className="font-bold text-[11px] uppercase tracking-wider text-[#DBCEB1]">SSB Border Control</span>
        </div>
        <p className="text-[10px] font-mono text-[#71807A] mt-1">Terminal ID: SSB-DEL-04</p>
      </div>
    </aside>
  );
}

