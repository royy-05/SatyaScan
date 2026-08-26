import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Shield, Lock, ArrowLeft } from "lucide-react";

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#FDF6F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 rounded-md bg-[#283733] border border-[#475853] items-center justify-center text-[#DBCEB1] mb-1 shadow-md">
            <Lock className="h-7 w-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#283733] uppercase tracking-wider">
            Account Provisioning
          </h1>
          <p className="text-xs font-semibold text-[#71807A] uppercase tracking-widest">
            SatyaScan Institutional Security Policy
          </p>
        </div>

        <Card className="border border-[#71807A]/30 bg-white shadow-md p-6 space-y-4 text-center">
          <div className="p-4 bg-[#FCF5EE] border border-[#71807A]/25 rounded-md space-y-2">
            <h3 className="text-sm font-bold text-[#283733] uppercase tracking-wider">
              Restricted Registration
            </h3>
            <p className="text-xs text-[#71807A] leading-relaxed font-sans">
              Self-registration is disabled. Account provisioning is managed strictly by an authorized system administrator.
            </p>
          </div>

          <p className="text-xs text-[#71807A]">
            To request checkpoint operator credentials, contact your Border Security Station Administrator.
          </p>

          <Link to="/login" className="block pt-2">
            <Button variant="primary" className="w-full py-5 text-xs font-bold uppercase tracking-wider bg-[#283733] hover:bg-[#475853]">
              <ArrowLeft className="mr-2 h-4 w-4" /> Return to Terminal Sign In
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
