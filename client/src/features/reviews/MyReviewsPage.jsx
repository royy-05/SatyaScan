import React, { useEffect, useState } from "react";
import { reviewsApi } from "./api";
import { Card } from "../../components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { PageHeader } from "../../components/ui/PageHeader";
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
      <PageHeader
        title="Officer Decision History"
        description="Audit record of manual verification decisions submitted by your officer account."
        badge={<Badge variant="default">My History</Badge>}
      />

      <Card className="p-0 overflow-hidden border border-[#71807A]/25 bg-white">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-[#71807A] space-y-3">
            <FileText className="h-10 w-10 mx-auto text-[#71807A]" />
            <p className="text-sm font-bold text-[#283733]">No Decision History Recorded</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#FCF5EE] border-b border-[#71807A]/20">
              <TableRow>
                <TableHead className="text-[#283733] font-bold">Document Case</TableHead>
                <TableHead className="text-[#283733] font-bold">Submitter</TableHead>
                <TableHead className="text-[#283733] font-bold">Verdict Decision</TableHead>
                <TableHead className="text-[#283733] font-bold">Officer Rationale</TableHead>
                <TableHead className="text-[#283733] font-bold">Decision Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((rev) => (
                <TableRow key={rev.id} className="hover:bg-[#FCF5EE]/50">
                  <TableCell>
                    <p className="font-bold text-xs text-[#283733]">{rev.document?.originalFilename}</p>
                    <p className="text-[10px] font-mono text-[#71807A]">{rev.document?.docType}</p>
                  </TableCell>
                  <TableCell className="text-xs text-[#283733]">
                    {rev.document?.submitter?.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={rev.decision === "APPROVE" ? "PASS" : "FAIL"}>
                      {rev.decision}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-[#283733] max-w-xs truncate font-mono bg-[#FCF5EE] p-2 rounded">
                    {rev.notes}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-[#71807A]">
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

