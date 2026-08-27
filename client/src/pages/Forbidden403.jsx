import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export function Forbidden403Page() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 text-center font-sans antialiased text-[#0F172A]">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="h-16 w-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">403 Access Denied</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Security Restriction: Your active user account does not possess the required RBAC role permissions to inspect this operational route.
          </p>
        </div>
        <Link to="/app/dashboard" className="block pt-2">
          <Button className="w-full h-11 bg-[#0FA891] hover:bg-[#0D8F7B] text-white font-bold text-xs uppercase tracking-wider rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Forbidden403Page;
