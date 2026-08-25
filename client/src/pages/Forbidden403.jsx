import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export function Forbidden403Page() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-100">403 Forbidden</h1>
          <p className="text-sm text-slate-400">
            Access denied. You do not have the required checkpoint authorization role for this portal route.
          </p>
        </div>
        <Link to="/app/dashboard">
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
