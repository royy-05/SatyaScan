import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { documentsApi } from "./api";
import { Card } from "../../components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/Select";
import { Skeleton } from "../../components/ui/Skeleton";
import { PageHeader } from "../../components/ui/PageHeader";
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
      <PageHeader
        title="Document Case Submissions"
        description="Inspect and review case records stored in official verification vault."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-36">
              <Select value={verdictFilter} onValueChange={(val) => { setVerdictFilter(val); setPage(1); }}>
                <SelectTrigger className="h-9 bg-white border-[#71807A]/30">
                  <SelectValue placeholder="Verdict" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#71807A]/30">
                  <SelectItem value="ALL">All Verdicts</SelectItem>
                  <SelectItem value="PASS">PASS</SelectItem>
                  <SelectItem value="REVIEW">REVIEW</SelectItem>
                  <SelectItem value="FAIL">FAIL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-40">
              <Select value={docTypeFilter} onValueChange={(val) => { setDocTypeFilter(val); setPage(1); }}>
                <SelectTrigger className="h-9 bg-white border-[#71807A]/30">
                  <SelectValue placeholder="Doc Type" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#71807A]/30">
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
        }
      />

      <Card className="p-0 overflow-hidden border border-[#71807A]/25 bg-white">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-[#71807A] space-y-3">
            <FileText className="h-10 w-10 mx-auto text-[#71807A]" />
            <p className="text-sm font-bold text-[#283733]">No Case Records Found</p>
            <p className="text-xs">Adjust filter settings or submit a new document scan.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#FCF5EE] border-b border-[#71807A]/20">
              <TableRow>
                <TableHead className="text-[#283733] font-bold">Document Case & Type</TableHead>
                <TableHead className="text-[#283733] font-bold">Submitter</TableHead>
                <TableHead className="text-[#283733] font-bold">Uploaded Date</TableHead>
                <TableHead className="text-[#283733] font-bold">Status</TableHead>
                <TableHead className="text-[#283733] font-bold">Verdict</TableHead>
                <TableHead className="text-[#283733] font-bold">Confidence</TableHead>
                <TableHead className="text-right text-[#283733] font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => {
                const latestVer = doc.verifications?.[0];
                return (
                  <TableRow key={doc.id} className="hover:bg-[#FCF5EE]/50">
                    <TableCell>
                      <div>
                        <p className="font-bold text-xs text-[#283733]">{doc.originalFilename}</p>
                        <p className="text-[10px] font-mono text-[#71807A]">{doc.docType}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-semibold text-[#283733]">{doc.submitter?.name || "System"}</p>
                      <p className="text-[10px] font-mono text-[#71807A]">{doc.submitter?.email}</p>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-[#71807A]">
                      {new Date(doc.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={doc.status}>{doc.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {latestVer ? (
                        <Badge variant={latestVer.verdict}>{latestVer.verdict}</Badge>
                      ) : (
                        <span className="text-xs text-[#71807A]">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {latestVer ? (
                        <span className="font-mono text-xs font-bold text-[#475853]">
                          {(latestVer.overallScore * 100).toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-xs text-[#71807A]">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/app/submissions/${doc.id}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          Inspect Case
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
        <div className="flex items-center justify-between text-xs text-[#71807A]">
          <p>
            Showing page <span className="font-bold text-[#283733]">{meta.page}</span> of{" "}
            <span className="font-bold text-[#283733]">{meta.totalPages}</span> ({meta.total} total cases)
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

