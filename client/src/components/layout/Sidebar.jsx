import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { APP_ROUTES } from "../../routes/config";
import LogoImg from "../../assets/Logo.png";
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
  ScanLine,
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
  ScanLine,
};

export function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const allowedRoutes = APP_ROUTES.filter(
    (route) => route.inSidebar && route.roles.includes(user.role)
  );

  // Group routes into sections
  const mainRoutes = allowedRoutes.filter((r) =>
    ["/app/dashboard", "/app/scan", "/app/submit", "/app/submissions", "/app/profile"].includes(r.path)
  );
  const opsRoutes = allowedRoutes.filter((r) =>
    ["/app/reviews/queue", "/app/reviews/mine"].includes(r.path)
  );
  const systemRoutes = allowedRoutes.filter((r) =>
    ["/app/admin/users", "/app/admin/audit", "/app/admin/stats"].includes(r.path)
  );

  return (
    <aside className="w-64 shrink-0 bg-white text-[#0F172A] border-r border-slate-200 flex flex-col h-screen sticky top-0 shadow-xs">
      {/* Brand Header with Official Logo */}
      <div className="p-5 border-b border-slate-100 flex items-center space-x-3 bg-white">
        <Link to="/app/dashboard" className="flex items-center space-x-3">
          {LogoImg ? (
            <img src={LogoImg} alt="SatyaScan Logo" className="h-9 w-auto object-contain" />
          ) : (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-[#0FA891] flex items-center justify-center font-extrabold text-white text-base">
                S
              </div>
              <span className="font-extrabold text-lg tracking-tight text-[#0F172A]">
                Satya<span className="text-[#0FA891]">Scan</span>
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
        {/* Main Section */}
        {mainRoutes.length > 0 && (
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Workstation Nav
            </div>
            {mainRoutes.map((route) => {
              const IconComponent = ICON_MAP[route.icon] || FileText;
              return (
                <NavLink
                  key={route.path}
                  to={route.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150",
                      isActive
                        ? "bg-[#0FA891] text-white font-bold shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]"
                    )
                  }
                >
                  <IconComponent className="h-4 w-4 shrink-0 text-current" />
                  <span>{route.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}

        {/* Operations Section */}
        {opsRoutes.length > 0 && (
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
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
                      "flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150",
                      isActive
                        ? "bg-[#0FA891] text-white font-bold shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]"
                    )
                  }
                >
                  <IconComponent className="h-4 w-4 shrink-0 text-current" />
                  <span>{route.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}

        {/* System Administration Section */}
        {systemRoutes.length > 0 && (
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
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
                      "flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150",
                      isActive
                        ? "bg-[#0FA891] text-white font-bold shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]"
                    )
                  }
                >
                  <IconComponent className="h-4 w-4 shrink-0 text-current" />
                  <span>{route.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
