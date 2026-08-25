import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { documentsApi } from "./api";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/Select";
import { Skeleton } from "../../components/ui/Skeleton";
import { FileText, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export function SubmissionsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verdictFilter, setVerdictFilter] = useState("ALL");
  const [docTypeFilter, setDocTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize: 10,
      };
      if (verdictFilter !== "ALL") params.verdict = verdictFilter;
      if (docTypeFilter !== "ALL") params.docType = docTypeFilter;

      const res = await documentsApi.list(params);
      setDocuments(res.data || []);
      setMeta(res.meta || { page: 1, totalPages: 1, total: 0 });
    } catch (_err) {
      // Handled in interceptor toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page, verdictFilter, docTypeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Document Submissions</h1>
          <p className="text-sm text-slate-400">View and inspect document verification history.</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-36">
            <Select value={verdictFilter} onValueChange={(val) => { setVerdictFilter(val); setPage(1); }}>
              <SelectTrigger className="h-9 bg-slate-900">
                <SelectValue placeholder="Verdict" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Verdicts</SelectItem>
                <SelectItem value="PASS">PASS</SelectItem>
                <SelectItem value="REVIEW">REVIEW</SelectItem>
                <SelectItem value="FAIL">FAIL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-40">
            <Select value={docTypeFilter} onValueChange={(val) => { setDocTypeFilter(val); setPage(1); }}>
              <SelectTrigger className="h-9 bg-slate-900">
                <SelectValue placeholder="Doc Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Doc Types</SelectItem>
                <SelectItem value="PASSPORT">Passport</SelectItem>
                <SelectItem value="VISA">Entry Visa</SelectItem>
                <SelectItem value="NATIONAL_ID">National ID</SelectItem>
                <SelectItem value="DRIVING_LICENSE">Driving License</SelectItem>
                <SelectItem value="PERMIT">Border Pass</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900/60 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <FileText className="h-10 w-10 mx-auto text-slate-600" />
            <p className="text-base font-semibold">No submissions found</p>
            <p className="text-xs">Adjust your filter options or upload a new document.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename & Type</TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead>Date Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Latest Verdict</TableHead>
                <TableHead>Confidence Score</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => {
                const latestVer = doc.verifications?.[0];
                return (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-200">{doc.originalFilename}</p>
                        <p className="text-xs text-slate-400">{doc.docType}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-medium text-slate-300">{doc.submitter?.name || "System"}</p>
                      <p className="text-[10px] text-slate-400">{doc.submitter?.email}</p>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {new Date(doc.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={doc.status}>{doc.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {latestVer ? (
                        <Badge variant={latestVer.verdict}>{latestVer.verdict}</Badge>
                      ) : (
                        <span className="text-xs text-slate-500">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {latestVer ? (
                        <span className="font-mono text-xs font-semibold text-cyan-400">
                          {(latestVer.overallScore * 100).toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/app/submissions/${doc.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
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
