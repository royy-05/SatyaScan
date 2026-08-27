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
import { User, LogOut } from "lucide-react";

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
    <header className="h-16 bg-white text-[#0F172A] border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Left side empty or brand spacing */}
      <div className="flex items-center space-x-3">
        {/* Clean spacing, no checkpoint text */}
      </div>

      <div className="flex items-center space-x-4">
        {/* User Role Badge */}
        <Badge variant={getRoleBadgeVariant(user.role)}>
          {user.role}
        </Badge>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors">
              <Avatar className="h-8 w-8 border border-[#0FA891]">
                <AvatarFallback className="bg-[#0FA891] text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-[#0F172A] leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight font-mono">
                  {user.email}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200 text-[#0F172A] shadow-xl">
            <DropdownMenuLabel className="text-xs text-slate-500 uppercase font-bold tracking-wider">Account Overview</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem asChild className="focus:bg-slate-100 focus:text-[#0F172A] text-xs cursor-pointer">
              <Link to="/app/profile" className="flex items-center space-x-2 w-full">
                <User className="h-4 w-4 text-[#0FA891]" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem
              onClick={logout}
              className="text-red-600 focus:bg-red-50 focus:text-red-700 text-xs cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default Topbar;
