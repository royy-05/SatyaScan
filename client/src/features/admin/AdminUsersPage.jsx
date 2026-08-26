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
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "OFFICER",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data || []);
    } catch (_err) {
      // Handled in interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createUser(formData);
      toast.success("User account created successfully!");
      setOpenModal(false);
      setFormData({ name: "", email: "", password: "", role: "OFFICER" });
      fetchUsers();
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Official User Management Station"
        description="Provision accounts, assign RBAC roles, and manage border checkpoint operator access."
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

      <Card className="p-0 overflow-hidden border border-[#71807A]/25 bg-white">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#FCF5EE] border-b border-[#71807A]/20">
              <TableRow>
                <TableHead className="text-[#283733] font-bold">Operator Name & Email</TableHead>
                <TableHead className="text-[#283733] font-bold">Assigned Role</TableHead>
                <TableHead className="text-[#283733] font-bold">Account Status</TableHead>
                <TableHead className="text-[#283733] font-bold">Created Timestamp</TableHead>
                <TableHead className="text-right text-[#283733] font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="hover:bg-[#FCF5EE]/50">
                  <TableCell>
                    <p className="font-bold text-xs text-[#283733]">{u.name}</p>
                    <p className="text-[10px] font-mono text-[#71807A]">{u.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === "ADMIN" ? "FAIL" : u.role === "OFFICER" ? "REVIEW" : "PASS"}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center text-xs font-bold font-mono ${u.isActive ? "text-[#2F7D5A]" : "text-[#B84A4A]"}`}>
                      <span className={`h-2 w-2 rounded-full mr-1.5 ${u.isActive ? "bg-[#2F7D5A]" : "bg-[#B84A4A]"}`} />
                      {u.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-[#71807A]">
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
    </div>
  );
}
