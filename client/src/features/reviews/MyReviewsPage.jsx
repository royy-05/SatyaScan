import React, { useEffect, useState } from "react";
import { reviewsApi } from "./api";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { History, FileText } from "lucide-react";

export function MyReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyReviews() {
      setLoading(true);
      try {
        const res = await reviewsApi.getMyReviews();
        setReviews(res.data || []);
      } catch (_err) {
        // Handled in interceptor toast
      } finally {
        setLoading(false);
      }
    }
    fetchMyReviews();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <History className="h-6 w-6 text-cyan-400" />
          My Review History
        </h1>
        <p className="text-sm text-slate-400">
          History of manual verification decisions submitted by your officer account.
        </p>
      </div>

      <Card className="border-slate-800 bg-slate-900/60 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <FileText className="h-10 w-10 mx-auto text-slate-600" />
            <p className="text-base font-semibold">No decision history recorded yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Notes & Rationale</TableHead>
                <TableHead>Decision Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((rev) => (
                <TableRow key={rev.id}>
                  <TableCell>
                    <p className="font-semibold text-slate-200">{rev.document?.originalFilename}</p>
                    <p className="text-xs text-slate-400">{rev.document?.docType}</p>
                  </TableCell>
                  <TableCell className="text-xs text-slate-300">
                    {rev.document?.submitter?.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={rev.decision === "APPROVE" ? "PASS" : "FAIL"}>
                      {rev.decision}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-300 max-w-xs truncate">
                    {rev.notes}
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">
                    {new Date(rev.createdAt).toLocaleString()}
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
