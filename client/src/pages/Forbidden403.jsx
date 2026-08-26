import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export function Forbidden403Page() {
  return (
    <div className="min-h-screen bg-[#FDF6F0] flex items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-6 bg-white p-8 rounded-md border border-[#71807A]/30 shadow-md">
        <div className="h-16 w-16 rounded bg-[#B84A4A]/10 border border-[#B84A4A]/30 flex items-center justify-center text-[#B84A4A] mx-auto">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#283733] uppercase tracking-wider">403 ACCESS DENIED</h1>
          <p className="text-xs text-[#71807A] leading-relaxed">
            Security Restriction: Your active user account does not possess the required RBAC role permissions to inspect this operational route.
          </p>
        </div>
        <Link to="/app/dashboard" className="block pt-2">
          <Button variant="primary" className="w-full py-5 text-xs font-bold uppercase tracking-wider bg-[#283733] hover:bg-[#475853]">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

