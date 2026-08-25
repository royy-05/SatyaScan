import React, { useEffect, useState } from "react";
import { adminApi } from "./api";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/Select";
import { Skeleton } from "../../components/ui/Skeleton";
import { Activity, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityType, setEntityType] = useState("ALL");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: 15 };
      if (entityType !== "ALL") params.entityType = entityType;

      const res = await adminApi.getAuditLogs(params);
      setLogs(res.data || []);
      setMeta(res.meta || { page: 1, totalPages: 1, total: 0 });
    } catch (_err) {
      // Handled in interceptor toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, entityType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="h-6 w-6 text-cyan-400" />
            System Audit Logs
          </h1>
          <p className="text-sm text-slate-400">
            Immutable forensic event timeline capturing system activity.
          </p>
        </div>

        <div className="w-48">
          <Select value={entityType} onValueChange={(val) => { setEntityType(val); setPage(1); }}>
            <SelectTrigger className="h-9 bg-slate-900">
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Entity Types</SelectItem>
              <SelectItem value="Document">Document</SelectItem>
              <SelectItem value="User">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900/60 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No audit entries found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target Entity</TableHead>
                <TableHead>Metadata</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-slate-400 font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-semibold text-slate-200">{log.actor?.name || "System"}</p>
                    <p className="text-[10px] text-slate-400">{log.actor?.email}</p>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs font-semibold text-cyan-400">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-300">
                    {log.entityType}:{log.entityId?.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="text-xs text-slate-400 font-mono max-w-xs truncate">
                    {log.metadata ? JSON.stringify(log.metadata) : "N/A"}
                  </TableCell>
                  <TableCell className="text-xs text-slate-400 font-mono">
                    {log.ipAddress || "Internal"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Pagination Footer */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          <p>
            Showing page <span className="font-semibold text-slate-200">{meta.page}</span> of{" "}
            <span className="font-semibold text-slate-200">{meta.totalPages}</span> ({meta.total} total)
          </p>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
