import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { documentsApi } from "./api";
import { useAuth } from "../../hooks/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  FileText,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  History,
} from "lucide-react";
import { toast } from "sonner";

export function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reverifying, setReverifying] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await documentsApi.getById(id);
      setDoc(res.data);
    } catch (_err) {
      // Interceptor toast handles error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleReverify = async () => {
    setReverifying(true);
    try {
      const res = await documentsApi.reverify(id);
      setDoc(res.data);
      toast.success("Document re-verified successfully!");
    } catch (_err) {
      // Interceptor toast handles error
    } finally {
      setReverifying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full lg:col-span-1" />
          <Skeleton className="h-96 w-full lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-400">Document not found.</p>
        <Button onClick={() => navigate("/app/submissions")}>Back to Submissions</Button>
      </div>
    );
  }

  const latestVerification = doc.verifications?.[0];
  const API_BASE = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:4000";
  const imagePreviewUrl = `${API_BASE}/uploads/${doc.filePath}`;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              {doc.originalFilename}
              <Badge variant={doc.status}>{doc.status}</Badge>
            </h1>
            <p className="text-xs text-slate-400">
              ID: {doc.id} • {doc.docType} • SHA256: {doc.fileHash.substring(0, 12)}...
            </p>
          </div>
        </div>

        {user.role === "ADMIN" && (
          <Button
            onClick={handleReverify}
            disabled={reverifying}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${reverifying ? "animate-spin" : ""}`} />
            {reverifying ? "Re-verifying..." : "Re-verify AI Engine"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Image Preview & Overview */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-slate-800 bg-slate-900/60 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300">Document Scan Preview</h3>
            <div className="rounded-lg overflow-hidden border border-slate-800 bg-black/40 flex items-center justify-center p-2 min-h-[220px]">
              <img
                src={imagePreviewUrl}
                alt="Document preview"
                className="max-h-72 w-full object-contain rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/400x250/0f172a/94a3b8?text=Image+Preview+Unavailable";
                }}
              />
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <p>Uploaded by: <span className="text-slate-200">{doc.submitter?.name || "System"}</span></p>
              <p>MIME Type: <span className="text-slate-200">{doc.mimeType}</span></p>
              <p>File Size: <span className="text-slate-200">{(doc.sizeBytes / 1024).toFixed(1)} KB</span></p>
            </div>
          </Card>

          {/* Verdict Summary Card */}
          {latestVerification && (
            <Card className="border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Overall Verdict</span>
                <Badge variant={latestVerification.verdict}>{latestVerification.verdict}</Badge>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Confidence Score</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {(latestVerification.overallScore * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      latestVerification.verdict === "PASS"
                        ? "bg-emerald-500"
                        : latestVerification.verdict === "REVIEW"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, latestVerification.overallScore * 100)}%` }}
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500">
                Engine Version: {latestVerification.engineVersion}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Extracted Fields & DYNAMIC Layer Breakdown */}
        <div className="space-y-6 lg:col-span-2">
          {/* Extracted MRZ / Textual Fields */}
          {latestVerification && (
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Extracted Identity Fields</CardTitle>
                <CardDescription>Structured textual data extracted by OCR engine</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Full Name</p>
                    <p className="text-sm font-semibold text-slate-100">{latestVerification.extractedName || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Document Number</p>
                    <p className="text-sm font-mono font-semibold text-cyan-400">{latestVerification.extractedDocNumber || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Nationality</p>
                    <p className="text-sm font-semibold text-slate-100">{latestVerification.extractedNationality || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Date of Birth</p>
                    <p className="text-sm font-semibold text-slate-100">{latestVerification.extractedDob || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Expiration Date</p>
                    <p className="text-sm font-semibold text-slate-100">{latestVerification.extractedExpiry || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Gender</p>
                    <p className="text-sm font-semibold text-slate-100">{latestVerification.extractedGender || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* DYNAMIC Layer Verification Breakdown (Requirement #20) */}
          {latestVerification && latestVerification.layers && (
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Forensic Analysis Layers</CardTitle>
                <CardDescription>Multi-layer confidence scores evaluated dynamically</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(latestVerification.layers).map(([layerKey, layerData]) => {
                    const isPassed = layerData?.passed !== false;
                    const confidence = layerData?.confidence !== undefined ? layerData.confidence : 1.0;
                    const notes = layerData?.notes || "No forensic anomalies detected.";

                    return (
                      <div
                        key={layerKey}
                        className={`p-4 rounded-xl border transition-all ${
                          isPassed
                            ? "bg-slate-950/50 border-slate-800"
                            : "bg-rose-950/20 border-rose-800/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                            {layerKey} Layer
                          </span>
                          <div className="flex items-center space-x-1.5">
                            {isPassed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-rose-400" />
                            )}
                            <span
                              className={`text-xs font-bold font-mono ${
                                isPassed ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {(confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400">{notes}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review Decisions History */}
          {doc.reviewDecisions && doc.reviewDecisions.length > 0 && (
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4 text-cyan-400" />
                  Officer Review History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {doc.reviewDecisions.map((rd) => (
                  <div key={rd.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">
                        Officer {rd.reviewer?.name || "Reviewer"}
                      </span>
                      <Badge variant={rd.decision === "APPROVE" ? "PASS" : "FAIL"}>
                        {rd.decision}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300">{rd.notes}</p>
                    <p className="text-[10px] text-slate-500">{new Date(rd.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
