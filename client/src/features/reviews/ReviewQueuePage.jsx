import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { reviewsApi } from "./api";
import { Card } from "../../components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { PageHeader } from "../../components/ui/PageHeader";
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
      <PageHeader
        title="Officer Review Queue"
        description="Documents flagged with REVIEW verdict awaiting official border officer decision."
        badge={<Badge variant="REVIEW">Action Required</Badge>}
      />

      <Card className="p-0 overflow-hidden border border-[#71807A]/25 bg-white">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : queue.length === 0 ? (
          <div className="p-12 text-center text-[#71807A] space-y-3">
            <CheckCircle2 className="h-10 w-10 mx-auto text-[#2F7D5A]" />
            <p className="text-base font-bold text-[#283733]">Review Queue Clear</p>
            <p className="text-xs">All flagged document verifications have been processed.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#FCF5EE] border-b border-[#71807A]/20">
              <TableRow>
                <TableHead className="text-[#283733] font-bold">Filename & Type</TableHead>
                <TableHead className="text-[#283733] font-bold">Submitter</TableHead>
                <TableHead className="text-[#283733] font-bold">Submitted Date</TableHead>
                <TableHead className="text-[#283733] font-bold">AI Verdict</TableHead>
                <TableHead className="text-[#283733] font-bold">Confidence</TableHead>
                <TableHead className="text-right text-[#283733] font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((doc) => {
                const ver = doc.verifications?.[0];
                return (
                  <TableRow key={doc.id} className="hover:bg-[#FCF5EE]/50">
                    <TableCell>
                      <div>
                        <p className="font-bold text-xs text-[#283733]">{doc.originalFilename}</p>
                        <p className="text-[10px] font-mono text-[#71807A]">{doc.docType}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-semibold text-[#283733]">{doc.submitter?.name}</p>
                      <p className="text-[10px] font-mono text-[#71807A]">{doc.submitter?.email}</p>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-[#71807A]">
                      {new Date(doc.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="REVIEW">REVIEW</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-[#C58A32]">
                      {ver ? `${(ver.overallScore * 100).toFixed(0)}%` : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/app/reviews/${doc.id}`}>
                        <Button size="sm" variant="gold" className="text-xs">
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

