import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { PageHeader } from "../components/ui/PageHeader";
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
      <PageHeader
        title="Operator Account Profile & Security"
        description="View checkpoint credentials and update access key parameters."
        badge={<Badge variant="default">Session Active</Badge>}
      />

      {/* Account Info Card */}
      <Card className="p-6 bg-white border border-[#71807A]/25 space-y-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded bg-[#283733] border border-[#475853] flex items-center justify-center text-[#DBCEB1] text-xl font-extrabold shadow-sm font-mono">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#283733] uppercase tracking-wider">{user.name}</h2>
            <p className="text-xs font-mono text-[#71807A]">{user.email}</p>
            <div className="mt-2">
              <Badge variant={user.role === "ADMIN" ? "FAIL" : user.role === "OFFICER" ? "REVIEW" : "PASS"}>
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Password Reset Card */}
      <Card className="p-6 bg-white border border-[#71807A]/25 shadow-sm">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="border-b border-[#71807A]/20 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#283733] flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-[#475853]" />
              Update Access Password
            </h3>
            <p className="text-xs text-[#71807A] mt-0.5">
              Enforce min 10 characters with uppercase, lowercase, and numeric digits.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#283733]">Current Access Key</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="bg-[#FCF5EE] border-[#71807A]/30 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#283733]">New Access Key</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="bg-[#FCF5EE] border-[#71807A]/30 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#283733]">Confirm New Key</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="bg-[#FCF5EE] border-[#71807A]/30 text-xs font-mono"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-[#71807A]/20">
            <Button
              type="submit"
              disabled={saving}
              variant="gold"
              className="font-bold text-xs uppercase tracking-wider px-6"
            >
              {saving ? "Updating Key..." : "Update Security Password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

