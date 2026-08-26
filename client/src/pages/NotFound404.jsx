import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { FileQuestion, ArrowLeft } from "lucide-react";

export function NotFound404Page() {
  return (
    <div className="min-h-screen bg-[#FDF6F0] flex items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-6 bg-white p-8 rounded-md border border-[#71807A]/30 shadow-md">
        <div className="h-16 w-16 rounded bg-[#283733] border border-[#475853] flex items-center justify-center text-[#DBCEB1] mx-auto">
          <FileQuestion className="h-8 w-8 stroke-[2]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#283733] uppercase tracking-wider">404 RESOURCE NOT FOUND</h1>
          <p className="text-xs text-[#71807A] leading-relaxed">
            The requested checkpoint path or document record does not exist in the system index.
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

