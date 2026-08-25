import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { adminApi } from "./api";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/Select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/Dialog";
import { Skeleton } from "../../components/ui/Skeleton";
import { Users, UserPlus, Search, Shield, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const createUserSchema = z.object({
  email: z.string().email("Valid email address required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters long")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["SUBMITTER", "OFFICER", "ADMIN"]),
});

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      role: "SUBMITTER",
    },
  });

  const selectedRole = watch("role");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ search });
      setUsers(res.data || []);
    } catch (_err) {
      // Interceptor toast handles error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const onCreateUser = async (data) => {
    try {
      await adminApi.createUser(data);
      toast.success(`User ${data.name} created successfully!`);
      setCreateDialogOpen(false);
      reset();
      fetchUsers();
    } catch (_err) {
      // Interceptor toast handles error
    }
  };

  const toggleUserActive = async (userId, currentActive) => {
    try {
      await adminApi.updateUser(userId, { isActive: !currentActive });
      toast.success("User active status updated");
      fetchUsers();
    } catch (_err) {
      // Interceptor toast handles error
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-400" />
            User Management Console
          </h1>
          <p className="text-sm text-slate-400">
            Create, manage roles, and activate/deactivate checkpoint personnel accounts.
          </p>
        </div>

        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Create New User
        </Button>
      </div>

      <Card className="border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No users match search criteria.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Profile</TableHead>
                <TableHead>System Role</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <p className="font-semibold text-slate-200">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === "ADMIN" ? "FAIL" : u.role === "OFFICER" ? "REVIEW" : "PASS"}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.isActive ? (
                      <span className="inline-flex items-center text-xs text-emerald-400 font-medium">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs text-rose-400 font-medium">
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Deactivated
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={u.isActive ? "outline" : "secondary"}
                      onClick={() => toggleUserActive(u.id, u.isActive)}
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

      {/* Create User Modal Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Checkpoint Personnel</DialogTitle>
            <DialogDescription>
              Enforce strict credentials (min 10 chars, letter + number).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onCreateUser)} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <Input {...register("name")} placeholder="Officer Vikram Singh" />
              {errors.name && <p className="text-xs text-rose-400">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <Input {...register("email")} type="email" placeholder="vikram@satyascan.local" />
              {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Input {...register("password")} type="password" placeholder="••••••••••••" />
              {errors.password && <p className="text-xs text-rose-400">{errors.password.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Assigned Role</label>
              <Select value={selectedRole} onValueChange={(val) => setValue("role", val)}>
                <SelectTrigger className="w-full bg-slate-950">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUBMITTER">Submitter (Field Agent)</SelectItem>
                  <SelectItem value="OFFICER">Officer (Border Reviewer)</SelectItem>
                  <SelectItem value="ADMIN">Admin (System Administrator)</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-xs text-rose-400">{errors.role.message}</p>}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold">
                {isSubmitting ? "Creating..." : "Create Personnel Account"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
