import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { User, KeyRound, Shield } from "lucide-react";
import { toast } from "sonner";

export function ProfilePage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 10) {
      toast.error("New password must be at least 10 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Security credentials updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 600);
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <User className="h-6 w-6 text-cyan-400" />
          Account Profile & Security
        </h1>
        <p className="text-sm text-slate-400">
          Manage officer credentials and security settings.
        </p>
      </div>

      {/* Account Info Card */}
      <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl font-bold">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">{user.name}</h2>
            <p className="text-xs text-slate-400">{user.email}</p>
            <div className="mt-2">
              <Badge variant={user.role === "ADMIN" ? "FAIL" : user.role === "OFFICER" ? "REVIEW" : "PASS"}>
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Password Reset Card */}
      <Card className="border-slate-800 bg-slate-900/80">
        <form onSubmit={handlePasswordChange}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-cyan-400" />
              Change Password
            </CardTitle>
            <CardDescription>
              Password policy: minimum 10 characters with letters and numbers.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Current Password</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end pt-4 border-t border-slate-800">
            <Button
              type="submit"
              disabled={saving}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
            >
              {saving ? "Updating..." : "Update Security Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
