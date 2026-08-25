import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { reviewsApi } from "./api";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";

export function ReviewQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await reviewsApi.getQueue({ page, pageSize: 10 });
      setQueue(res.data || []);
      setMeta(res.meta || { page: 1, totalPages: 1, total: 0 });
    } catch (_err) {
      // Handled in interceptor toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-amber-400" />
          Officer Review Queue
        </h1>
        <p className="text-sm text-slate-400">
          Documents flagged with REVIEW verdict pending border officer decision.
        </p>
      </div>

      <Card className="border-slate-800 bg-slate-900/60 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : queue.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-400" />
            <p className="text-base font-semibold text-slate-200">Review Queue Empty</p>
            <p className="text-xs">All flagged document verifications have been processed.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename & Type</TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead>Submitted Date</TableHead>
                <TableHead>AI Verdict</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((doc) => {
                const ver = doc.verifications?.[0];
                return (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-200">{doc.originalFilename}</p>
                        <p className="text-xs text-slate-400">{doc.docType}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-medium text-slate-300">{doc.submitter?.name}</p>
                      <p className="text-[10px] text-slate-400">{doc.submitter?.email}</p>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {new Date(doc.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="REVIEW">REVIEW</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-amber-400">
                      {ver ? `${(ver.overallScore * 100).toFixed(0)}%` : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/app/reviews/${doc.id}`}>
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
                          Review Credential
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
