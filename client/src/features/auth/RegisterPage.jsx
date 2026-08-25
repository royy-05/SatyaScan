import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 relative z-10 text-center">
        <Card className="border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
          <CardHeader>
            <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <CardTitle>Registration Invite-Only</CardTitle>
            <CardDescription className="text-slate-300 pt-2">
              Public self-registration is disabled for border checkpoint security.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm text-slate-400">
            <p>
              Checkpoint submitters and officers must be issued official credentials by an authorized SatyaScan System Administrator.
            </p>
          </CardContent>

          <CardFooter>
            <Link to="/login" className="w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Login Terminal
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
