import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Badge } from "../ui/Badge";
import { Avatar, AvatarFallback } from "../ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";
import { User, LogOut, ShieldCheck } from "lucide-react";

export function Topbar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "US";

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "ADMIN":
        return "FAIL";
      case "OFFICER":
        return "REVIEW";
      default:
        return "PASS";
    }
  };

  return (
    <header className="h-14 bg-[#283733] text-[#FDF6F0] border-b border-[#475853] px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="flex items-center space-x-3">
        <ShieldCheck className="h-5 w-5 text-[#DBCEB1]" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#FDF6F0]">
          Official Checkpoint Terminal <span className="text-[#DBCEB1] font-mono">#04</span>
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* System Telemetry Status Indicator */}
        <div className="hidden md:flex items-center space-x-2 text-[11px] font-mono bg-[#1e2a27] px-2.5 py-1 rounded border border-[#475853]">
          <span className="h-2 w-2 rounded-full bg-[#2F7D5A] animate-pulse" />
          <span className="text-[#DBCEB1] font-semibold">SYSTEM OPERATIONAL</span>
        </div>

        {/* User Role Badge */}
        <Badge variant={getRoleBadgeVariant(user.role)}>
          {user.role}
        </Badge>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="flex items-center space-x-2.5 p-1 rounded hover:bg-[#475853]/50 transition-colors">
              <Avatar className="h-7 w-7 border border-[#DBCEB1]">
                <AvatarFallback className="bg-[#475853] text-[#DBCEB1] text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-[#FDF6F0] leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-[#DBCEB1]/80 leading-tight font-mono">
                  {user.email}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#283733] border-[#475853] text-[#FDF6F0]">
            <DropdownMenuLabel className="text-xs text-[#DBCEB1] uppercase font-bold tracking-wider">Account Overview</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#475853]" />
            <DropdownMenuItem asChild className="focus:bg-[#475853] focus:text-[#FDF6F0] text-xs cursor-pointer">
              <Link to="/app/profile" className="flex items-center space-x-2 w-full">
                <User className="h-4 w-4 text-[#DBCEB1]" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#475853]" />
            <DropdownMenuItem
              onClick={logout}
              className="text-[#B84A4A] focus:bg-[#B84A4A]/20 focus:text-[#B84A4A] text-xs cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Sign Out Terminal</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

