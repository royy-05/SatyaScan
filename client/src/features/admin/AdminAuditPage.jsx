import React, { useEffect, useState } from "react";
import { adminApi } from "./api";
import { Card } from "../../components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { PageHeader } from "../../components/ui/PageHeader";
import { Shield, ChevronLeft, ChevronRight, Eye } from "lucide-react";

export function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedMeta, setSelectedMeta] = useState(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLogs({ page, pageSize: 15 });
      setLogs(res.data || []);
      setMeta(res.meta || { page: 1, totalPages: 1, total: 0 });
    } catch (_err) {
      // Handled in interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & Immutable Audit Trail"
        description="Tamper-proof audit logs recording every document upload, AI verification, and officer review."
        badge={<Badge variant="default">Audit Vault</Badge>}
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
                <TableHead className="text-[#283733] font-bold">Timestamp</TableHead>
                <TableHead className="text-[#283733] font-bold">Actor</TableHead>
                <TableHead className="text-[#283733] font-bold">Action Event</TableHead>
                <TableHead className="text-[#283733] font-bold">Entity Type</TableHead>
                <TableHead className="text-[#283733] font-bold">IP Address</TableHead>
                <TableHead className="text-right text-[#283733] font-bold">Metadata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-[#FCF5EE]/50">
                  <TableCell className="text-xs font-mono text-[#71807A]">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-[#283733]">
                    {log.user?.email || "SYSTEM"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-[#283733] font-semibold">
                    {log.entityType}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-[#71807A]">
                    {log.ipAddress || "127.0.0.1"}
                  </TableCell>
                  <TableCell className="text-right">
                    {log.metadata ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedMeta(log.metadata)}
                        className="text-xs text-[#475853]"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> View Payload
                      </Button>
                    ) : (
                      <span className="text-xs text-[#71807A] font-mono">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Pagination Footer */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-[#71807A]">
          <p>
            Showing page <span className="font-bold text-[#283733]">{meta.page}</span> of{" "}
            <span className="font-bold text-[#283733]">{meta.totalPages}</span> ({meta.total} total log records)
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

      {/* Metadata JSON Modal */}
      <Dialog open={!!selectedMeta} onOpenChange={() => setSelectedMeta(null)}>
        <DialogContent className="bg-[#283733] text-[#FDF6F0] border-[#475853] max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider text-[#DBCEB1]">
              Event Metadata Payload JSON
            </DialogTitle>
          </DialogHeader>
          <pre className="p-4 bg-black/50 rounded text-xs font-mono text-[#DBCEB1] overflow-x-auto max-h-96">
            {JSON.stringify(selectedMeta, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
