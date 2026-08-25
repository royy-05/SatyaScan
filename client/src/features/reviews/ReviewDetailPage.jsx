import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { documentsApi } from "../documents/api";
import { reviewsApi } from "./api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Textarea } from "../../components/ui/Textarea";
import { Skeleton } from "../../components/ui/Skeleton";
import { ArrowLeft, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function ReviewDetailPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadDoc() {
      setLoading(true);
      try {
        const res = await documentsApi.getById(documentId);
        setDoc(res.data);
      } catch (_err) {
        // Interceptor toast handles error
      } finally {
        setLoading(false);
      }
    }
    if (documentId) loadDoc();
  }, [documentId]);

  const handleDecision = async (decision) => {
    if (!notes.trim()) {
      toast.error("Please enter official officer review notes before submitting decision");
      return;
    }

    setSubmitting(true);
    try {
      await reviewsApi.submitDecision(documentId, { decision, notes });
      toast.success(`Document decision recorded as ${decision}`);
      navigate("/app/reviews/queue");
    } catch (_err) {
      // Interceptor toast handles error
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Document not found.</p>
      </div>
    );
  }

  const latestVerification = doc.verifications?.[0];
  const API_BASE = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:4000";
  const imagePreviewUrl = `${API_BASE}/uploads/${doc.filePath}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-3">
        <Button variant="outline" size="sm" onClick={() => navigate("/app/reviews/queue")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Queue
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Credential Review: {doc.originalFilename}
          </h1>
          <p className="text-xs text-slate-400">ID: {doc.id} • {doc.docType}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document Scan Preview */}
        <Card className="border-slate-800 bg-slate-900/60 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">Document Image</h3>
          <div className="rounded-lg overflow-hidden border border-slate-800 bg-black/40 flex items-center justify-center p-2 min-h-[250px]">
            <img
              src={imagePreviewUrl}
              alt="Scan"
              className="max-h-80 w-full object-contain rounded"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/400x250/0f172a/94a3b8?text=Scan+Preview+Unavailable";
              }}
            />
          </div>
        </Card>

        {/* AI Forensic Summary & Extracted Data */}
        <Card className="border-slate-800 bg-slate-900/60 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">Extracted Credentials</h3>
          {latestVerification ? (
            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500">Name:</span> <span className="font-semibold text-slate-200">{latestVerification.extractedName || "N/A"}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500">Doc Number:</span> <span className="font-mono font-semibold text-cyan-400">{latestVerification.extractedDocNumber || "N/A"}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500">Nationality:</span> <span className="font-semibold text-slate-200">{latestVerification.extractedNationality || "N/A"}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500">Overall AI Score:</span> <span className="font-bold text-amber-400">{(latestVerification.overallScore * 100).toFixed(0)}%</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No verification details found.</p>
          )}
        </Card>
      </div>

      {/* Officer Decision Form */}
      <Card className="border-amber-500/30 bg-slate-900/80 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-slate-100">
            <ShieldCheck className="h-5 w-5 text-amber-400" />
            Official Border Officer Decision
          </CardTitle>
          <CardDescription>
            Record your decision and rationale into the official SSB audit log.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Officer Review Notes & Justification (Required)
            </label>
            <Textarea
              placeholder="Specify rationale for approving or rejecting this border credential..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-4 border-t border-slate-800 pt-4">
          <Button
            type="button"
            variant="destructive"
            disabled={submitting}
            onClick={() => handleDecision("REJECT")}
            className="px-6"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject Entry Credential
          </Button>

          <Button
            type="button"
            disabled={submitting}
            onClick={() => handleDecision("APPROVE")}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approve Entry Credential
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
