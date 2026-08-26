import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reviewsApi } from "./api";
import { documentsApi } from "../documents/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Textarea } from "../../components/ui/Textarea";
import { Skeleton } from "../../components/ui/Skeleton";
import { ForensicImageInspector } from "../../components/ui/ForensicImageInspector";
import { RiskScoreGauge } from "../../components/ui/RiskScoreGauge";
import { IdentityFieldGrid } from "../../components/ui/IdentityFieldGrid";
import { ForensicLayerCard } from "../../components/ui/ForensicLayerCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { ShieldAlert, CheckCircle2, XCircle, ArrowLeft, Loader2, FileSearch } from "lucide-react";
import { toast } from "sonner";

export function ReviewDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadDoc() {
      setLoading(true);
      try {
        const res = await documentsApi.getById(id);
        setDoc(res.data);
      } catch (_err) {
        // Handled in interceptor toast
      } finally {
        setLoading(false);
      }
    }
    if (id) loadDoc();
  }, [id]);

  const handleDecision = async (decision) => {
    if (!notes.trim()) {
      toast.error("Please enter mandatory officer decision notes/rationale.");
      return;
    }

    setSubmitting(true);
    try {
      await reviewsApi.submitDecision(id, {
        decision,
        notes,
      });
      toast.success(`Case decision submitted: ${decision}`);
      navigate("/app/reviews/queue");
    } catch (_err) {
      // Handled in interceptor toast
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="h-[450px] lg:col-span-5 w-full" />
          <Skeleton className="h-[450px] lg:col-span-7 w-full" />
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-[#71807A] text-sm font-semibold">Flagged document case not found.</p>
        <Button onClick={() => navigate("/app/reviews/queue")}>Back to Queue</Button>
      </div>
    );
  }

  const latestVerification = doc.verifications?.[0];
  const API_BASE = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:4000";
  const imagePreviewUrl = `${API_BASE}/uploads/${doc.filePath}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Officer Review Workstation: ${doc.originalFilename}`}
        description={`Document ID: ${doc.id} • Type: ${doc.docType}`}
        badge={<Badge variant="REVIEW">MANUAL REVIEW REQUIRED</Badge>}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Queue
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 5 COLS: Document Scan */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#283733]">
              Credential Scan Inspector
            </h3>
            <ForensicImageInspector src={imagePreviewUrl} alt={doc.originalFilename} />
          </Card>
        </div>

        {/* RIGHT 7 COLS: AI Evidence & Officer Decision Console */}
        <div className="lg:col-span-7 space-y-6">
          {latestVerification && (
            <RiskScoreGauge
              score={latestVerification.overallScore}
              verdict={latestVerification.verdict}
            />
          )}

          {latestVerification && (
            <Card className="p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#71807A]">
                Extracted Identity Credentials
              </h3>
              <IdentityFieldGrid extracted={latestVerification} />
            </Card>
          )}

          {latestVerification?.layers && (
            <Card className="p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#71807A]">
                Forensic Inspection Findings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(latestVerification.layers).map(([layerKey, layerData]) => (
                  <ForensicLayerCard key={layerKey} layerKey={layerKey} layerData={layerData} />
                ))}
              </div>
            </Card>
          )}

          {/* Official Officer Decision Console */}
          <Card className="p-6 border-2 border-[#475853] bg-white space-y-4 shadow-sm">
            <div className="border-b border-[#71807A]/20 pb-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#283733] flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-[#C58A32]" />
                Official Officer Decision Console
              </h3>
              <p className="text-xs text-[#71807A] mt-1">
                Provide mandatory decision rationale notes and record official verdict.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#283733]">
                Decision Notes & Rationale (Mandatory)
              </label>
              <Textarea
                placeholder="Enter formal rationale, forensic observation notes, or passport verification cross-reference..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-28 bg-[#FCF5EE] border-[#71807A]/40 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <Button
                variant="destructive"
                onClick={() => handleDecision("REJECT")}
                disabled={submitting}
                className="py-6 text-sm uppercase tracking-wider font-extrabold bg-[#B84A4A] hover:bg-[#a03d3d] text-white"
              >
                <XCircle className="mr-2 h-5 w-5" />
                {submitting ? "Submitting..." : "REJECT ENTRY"}
              </Button>

              <Button
                variant="default"
                onClick={() => handleDecision("APPROVE")}
                disabled={submitting}
                className="py-6 text-sm uppercase tracking-wider font-extrabold bg-[#2F7D5A] hover:bg-[#256347] text-white"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                {submitting ? "Submitting..." : "APPROVE ENTRY"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
