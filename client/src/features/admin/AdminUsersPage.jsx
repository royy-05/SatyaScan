import React, { useEffect, useState } from "react";
import { adminApi } from "./api";
import { Card } from "../../components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/Dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/Select";
import { Skeleton } from "../../components/ui/Skeleton";
import { PageHeader } from "../../components/ui/PageHeader";
import { UserPlus, CheckCircle, XCircle, Clock, ShieldAlert, Eye } from "lucide-react";
import { toast } from "sonner";

export function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'pending'
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [openModal, setOpenModal] = useState(false);
  const [approveUserTarget, setApproveUserTarget] = useState(null);
  const [rejectUserTarget, setRejectUserTarget] = useState(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [viewReasonUser, setViewReasonUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "OFFICER",
  });

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data || []);
    } catch (_err) {
      // Handled in interceptor
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const res = await adminApi.getPendingUsers();
      setPendingUsers(res.data || []);
    } catch (_err) {
      // Handled in interceptor
    }
  };

  const refreshAllData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchPendingUsers()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createUser(formData);
      toast.success("User account created successfully!");
      setOpenModal(false);
      setFormData({ name: "", email: "", password: "", role: "OFFICER" });
      refreshAllData();
    } catch (_err) {
      // Handled in interceptor
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await adminApi.updateUser(user.id, { isActive: !user.isActive });
      toast.success(`User status updated for ${user.name}`);
      fetchUsers();
    } catch (_err) {
      // Handled in interceptor
    }
  };

  const handleConfirmApprove = async () => {
    if (!approveUserTarget) return;
    try {
      await adminApi.approveUser(approveUserTarget.id);
      toast.success(`Officer ${approveUserTarget.name} has been approved!`);
      setApproveUserTarget(null);
      refreshAllData();
    } catch (_err) {
      // Handled in interceptor
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectUserTarget) return;
    if (!rejectNotes || rejectNotes.trim().length < 10) {
      toast.error("Rejection notes must be at least 10 characters long.");
      return;
    }
    try {
      await adminApi.rejectUser(rejectUserTarget.id, { notes: rejectNotes });
      toast.success(`Officer registration for ${rejectUserTarget.name} rejected.`);
      setRejectUserTarget(null);
      setRejectNotes("");
      refreshAllData();
    } catch (_err) {
      // Handled in interceptor
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Official User Management Station"
        description="Provision accounts, manage officer registration approvals, and enforce RBAC policy."
        actions={
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button variant="gold" size="sm" className="font-bold">
                <UserPlus className="h-4 w-4 mr-1.5" /> Provision New Account
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-[#71807A]/30 text-[#283733]">
              <DialogHeader>
                <DialogTitle className="text-base font-extrabold uppercase tracking-wider text-[#283733]">
                  Provision Operator Account
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#283733]">Full Name</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Officer Vikram Singh"
                    className="bg-[#FCF5EE] border-[#71807A]/30 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#283733]">Email Address</label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="vikram.singh@ssb.gov.in"
                    className="bg-[#FCF5EE] border-[#71807A]/30 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#283733]">Temporary Password</label>
                  <Input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="bg-[#FCF5EE] border-[#71807A]/30 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#283733]">System Role (RBAC)</label>
                  <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                    <SelectTrigger className="bg-[#FCF5EE] border-[#71807A]/30 text-xs">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#71807A]/30 text-xs">
                      <SelectItem value="OFFICER">OFFICER (Border Reviewer)</SelectItem>
                      <SelectItem value="ADMIN">ADMIN (System Controller)</SelectItem>
                      <SelectItem value="SUBMITTER">SUBMITTER (Field Operator)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="gold" className="font-bold">
                    Provision Account
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Tabs Row */}
      <div className="flex items-center space-x-3 border-b border-[#E2E8F0] pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "all"
              ? "bg-[#0F172A] text-white"
              : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
          }`}
        >
          All Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center space-x-2 ${
            activeTab === "pending"
              ? "bg-[#0FA891] text-white"
              : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
          }`}
        >
          <span>Pending Officer Approvals</span>
          {pendingUsers.length > 0 && (
            <span className="h-5 px-1.5 rounded-full bg-amber-500 text-white font-mono text-[10px] flex items-center justify-center font-extrabold">
              {pendingUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: All Users Table */}
      {activeTab === "all" && (
        <Card className="p-0 overflow-hidden border border-[#E2E8F0] bg-white">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <TableRow>
                  <TableHead className="text-[#0F172A] font-bold">Operator Name & Email</TableHead>
                  <TableHead className="text-[#0F172A] font-bold">Assigned Role</TableHead>
                  <TableHead className="text-[#0F172A] font-bold">Account Status</TableHead>
                  <TableHead className="text-[#0F172A] font-bold">Created Timestamp</TableHead>
                  <TableHead className="text-right text-[#0F172A] font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-[#F8FAFC]/50">
                    <TableCell>
                      <p className="font-bold text-xs text-[#0F172A]">{u.name}</p>
                      <p className="text-[10px] font-mono text-[#64748B]">{u.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.role === "ADMIN" ? "FAIL" : u.role === "OFFICER" ? "REVIEW" : "PASS"}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center text-xs font-bold font-mono ${u.isActive ? "text-[#059669]" : "text-red-600"}`}>
                        <span className={`h-2 w-2 rounded-full mr-1.5 ${u.isActive ? "bg-[#059669]" : "bg-red-600"}`} />
                        {u.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-[#64748B]">
                      {new Date(u.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(u)}
                        className="text-xs"
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* Tab 2: Pending Officer Approvals Table */}
      {activeTab === "pending" && (
        <Card className="p-0 overflow-hidden border border-[#E2E8F0] bg-white">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">No Pending Approvals</h3>
              <p className="text-xs text-[#64748B]">All officer registration requests have been reviewed.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <TableRow>
                  <TableHead className="text-[#0F172A] font-bold">Officer Candidate</TableHead>
                  <TableHead className="text-[#0F172A] font-bold">Contact Number</TableHead>
                  <TableHead className="text-[#0F172A] font-bold">Registration Reason</TableHead>
                  <TableHead className="text-[#0F172A] font-bold">Submitted Date</TableHead>
                  <TableHead className="text-right text-[#0F172A] font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((pu) => (
                  <TableRow key={pu.id} className="hover:bg-[#F8FAFC]/50">
                    <TableCell>
                      <p className="font-bold text-xs text-[#0F172A]">{pu.name}</p>
                      <p className="text-[10px] font-mono text-[#64748B]">{pu.email}</p>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-[#0F172A]">
                      {pu.contactNumber || "N/A"}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-xs text-[#334155] truncate">
                        {pu.registrationReason || "No reason provided."}
                      </p>
                      {pu.registrationReason && pu.registrationReason.length > 50 && (
                        <button
                          onClick={() => setViewReasonUser(pu)}
                          className="text-[11px] text-[#0FA891] font-semibold hover:underline inline-flex items-center mt-0.5"
                        >
                          <Eye className="h-3 w-3 mr-1" /> View full reason
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-[#64748B]">
                      {new Date(pu.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        onClick={() => setApproveUserTarget(pu)}
                        className="bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRejectUserTarget(pu);
                          setRejectNotes("");
                        }}
                        className="border-red-500 text-red-600 hover:bg-red-50 font-bold text-xs"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* Approve Confirmation Dialog */}
      {approveUserTarget && (
        <Dialog open={!!approveUserTarget} onOpenChange={() => setApproveUserTarget(null)}>
          <DialogContent className="bg-white text-[#0F172A]">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center space-x-2 text-[#059669]">
                <CheckCircle className="h-5 w-5" />
                <span>Approve Officer Access</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2 text-sm text-[#334155]">
              <p>
                Are you sure you want to approve officer access for <strong>{approveUserTarget.name}</strong> (
                <code>{approveUserTarget.email}</code>)?
              </p>
              <p className="text-xs text-[#64748B]">
                This will grant full officer permissions to review identity documents and make verification verdicts.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-[#E2E8F0]">
              <Button variant="outline" onClick={() => setApproveUserTarget(null)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmApprove} className="bg-[#059669] hover:bg-emerald-700 text-white font-bold">
                Confirm Approval
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Reason Dialog */}
      {rejectUserTarget && (
        <Dialog open={!!rejectUserTarget} onOpenChange={() => setRejectUserTarget(null)}>
          <DialogContent className="bg-white text-[#0F172A]">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center space-x-2 text-red-600">
                <ShieldAlert className="h-5 w-5" />
                <span>Reject Officer Registration</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <p className="text-sm text-[#334155]">
                Rejecting registration for <strong>{rejectUserTarget.name}</strong> (<code>{rejectUserTarget.email}</code>).
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  Reason for Rejection (Required, min 10 chars)
                </label>
                <textarea
                  rows={3}
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="e.g. Could not verify official security station assignment credentials."
                  className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-[#E2E8F0]">
              <Button variant="outline" onClick={() => setRejectUserTarget(null)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmReject} className="bg-red-600 hover:bg-red-700 text-white font-bold">
                Confirm Rejection
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Full Reason View Dialog */}
      {viewReasonUser && (
        <Dialog open={!!viewReasonUser} onOpenChange={() => setViewReasonUser(null)}>
          <DialogContent className="bg-white text-[#0F172A] max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                Registration Reason: {viewReasonUser.name}
              </DialogTitle>
            </DialogHeader>

            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#334155] leading-relaxed whitespace-pre-wrap">
              {viewReasonUser.registrationReason}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setViewReasonUser(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default AdminUsersPage;
