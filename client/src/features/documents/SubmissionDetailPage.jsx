import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { documentsApi } from "./api";
import { useAuth } from "../../hooks/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { ForensicImageInspector } from "../../components/ui/ForensicImageInspector";
import { RiskScoreGauge } from "../../components/ui/RiskScoreGauge";
import { IdentityFieldGrid } from "../../components/ui/IdentityFieldGrid";
import { ForensicLayerCard } from "../../components/ui/ForensicLayerCard";
import { AuditTimeline } from "../../components/ui/AuditTimeline";
import { PageHeader } from "../../components/ui/PageHeader";
import {
  FileText,
  RefreshCw,
  ArrowLeft,
  UserCheck,
  ShieldCheck,
  History,
  Shield,
  Layers,
  FileSearch,
} from "lucide-react";
import { toast } from "sonner";

export function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reverifying, setReverifying] = useState(false);
  const [activeTab, setActiveTab] = useState("IDENTITY");

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
    if (id && id !== "null" && id !== "undefined") {
      fetchDetail();
    } else {
      setLoading(false);
    }
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
        <p className="text-[#71807A] text-sm font-semibold">Document case file not found.</p>
        <Button onClick={() => navigate("/app/submissions")}>Back to Submissions</Button>
      </div>
    );
  }

  const latestVerification = doc.verifications?.[0];
  const API_BASE = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:4000";
  const imagePreviewUrl = `${API_BASE}/uploads/${doc.filePath}`;

  const faceLayer = latestVerification?.layers?.face;
  const isFaceVerified =
    faceLayer &&
    typeof faceLayer.confidence === "number" &&
    faceLayer.confidence > 0 &&
    !faceLayer.notes?.toLowerCase().includes("not run");

  const riskScore = latestVerification?.overallScore || 0;
  const isRejected = latestVerification?.verdict === "FAIL" || riskScore >= 70;

  let headerBadgeText = doc.status;
  let headerBadgeVariant = doc.status;

  if (isRejected) {
    headerBadgeText = "REJECTED / HIGH RISK";
    headerBadgeVariant = "FAIL";
  } else if (!isFaceVerified) {
    headerBadgeText = "PENDING BIOMETRICS";
    headerBadgeVariant = "REVIEW";
  } else if (doc.status === "VERIFIED" && isFaceVerified) {
    headerBadgeText = "VERIFIED";
    headerBadgeVariant = "PASS";
  } else if (doc.status === "FAILED") {
    headerBadgeText = "FAILED";
    headerBadgeVariant = "FAIL";
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={doc.originalFilename}
        badge={<Badge variant={headerBadgeVariant}>{headerBadgeText}</Badge>}
        description={`Document ID: ${doc.id} • Type: ${doc.docType} • SHA256: ${doc.fileHash.substring(0, 16)}...`}
        actions={
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>

            {!isFaceVerified && (
              <Button
                size="sm"
                variant="gold"
                onClick={() => navigate(`/app/submissions/${doc.id}/face-verify`)}
              >
                <UserCheck className="h-4 w-4 mr-1" /> Complete Biometric Verification
              </Button>
            )}

            {user.role === "ADMIN" && (
              <Button
                size="sm"
                variant="default"
                onClick={handleReverify}
                disabled={reverifying}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${reverifying ? "animate-spin" : ""}`} />
                {reverifying ? "Re-verifying..." : "Re-run AI Engine"}
              </Button>
            )}
          </div>
        }
      />

      {/* Split Screen Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 5 COLS: Forensic Image Inspector */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#71807A]/20 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#283733]">
                Document Image Scan
              </span>
              {isFaceVerified ? (
                <Badge variant="PASS" className="text-[10px]">
                  Face Match Passed ✓
                </Badge>
              ) : (
                <Badge variant="REVIEW" className="text-[10px]">
                  Face Check Pending
                </Badge>
              )}
            </div>

            <ForensicImageInspector 
              src={imagePreviewUrl} 
              alt={doc.originalFilename} 
              regions={latestVerification?.layers?.tampering?.tampered_regions || []}
            />

            <div className="text-[11px] font-mono text-[#71807A] space-y-1 bg-[#FCF5EE] p-3 rounded border border-[#71807A]/20">
              <p><strong className="text-[#283733]">Uploaded By:</strong> {doc.submitter?.name || "System"}</p>
              <p><strong className="text-[#283733]">MIME Format:</strong> {doc.mimeType}</p>
              <p><strong className="text-[#283733]">File Size:</strong> {(doc.sizeBytes / 1024).toFixed(1)} KB</p>
              <p><strong className="text-[#283733]">Device Hash:</strong> {doc.deviceFingerprint?.deviceHash ? doc.deviceFingerprint.deviceHash.substring(0, 16) + '...' : 'N/A'}</p>
              <p className="truncate"><strong className="text-[#283733]">Hash:</strong> {doc.fileHash}</p>
            </div>
          </Card>
        </div>

        {/* RIGHT 7 COLS: Intelligence Panel & Forensic Tabs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Risk Score Assessment Gauge */}
          {latestVerification && (
            <RiskScoreGauge
              score={latestVerification.overallScore}
              verdict={latestVerification.verdict}
            />
          )}

          {/* Forensic Tabs Panel */}
          {latestVerification && (
            <Card className="p-5 space-y-4">
              {/* Tab Navigation */}
              <div className="flex items-center space-x-2 border-b border-[#71807A]/20 pb-3">
                <Button
                  size="sm"
                  variant={activeTab === "IDENTITY" ? "primary" : "ghost"}
                  onClick={() => setActiveTab("IDENTITY")}
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  <FileSearch className="h-3.5 w-3.5 mr-1.5" /> Identity Fields
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === "FORENSICS" ? "primary" : "ghost"}
                  onClick={() => setActiveTab("FORENSICS")}
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  <Layers className="h-3.5 w-3.5 mr-1.5" /> Forensic Layers
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === "AUDIT" ? "primary" : "ghost"}
                  onClick={() => setActiveTab("AUDIT")}
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  <History className="h-3.5 w-3.5 mr-1.5" /> Case History
                </Button>
              </div>

              {/* TAB 1: IDENTITY */}
              {activeTab === "IDENTITY" && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#71807A]">
                    OCR Extracted Credentials
                  </h3>
                  <IdentityFieldGrid extracted={latestVerification} />
                  
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#71807A] pt-4">
                    Watchlist & Network Analysis
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-[#FCF5EE] rounded-lg border border-[#71807A]/20 flex justify-between items-center">
                      <span className="text-xs text-[#283733] font-semibold uppercase">Device Network</span>
                      <Badge variant={latestVerification.networkFlags?.sharedDeviceNetwork ? "FAIL" : "PASS"}>
                        {latestVerification.networkFlags?.sharedDeviceNetwork ? "SHARED HARDWARE DETECTED" : "UNIQUE DEVICE"}
                      </Badge>
                    </div>
                    <div className="p-3 bg-[#FCF5EE] rounded-lg border border-[#71807A]/20 flex justify-between items-center">
                      <span className="text-xs text-[#283733] font-semibold uppercase">Velocity Status</span>
                      <Badge variant={latestVerification.networkFlags?.velocityCount >= 5 ? "FAIL" : "PASS"}>
                        {latestVerification.networkFlags?.velocityCount >= 5 ? "RATE LIMITED / BLOCKED" : `VELOCITY: SAFE (${latestVerification.networkFlags?.velocityCount || 1}/5)`}
                      </Badge>
                    </div>
                    <div className="p-3 bg-[#FCF5EE] rounded-lg border border-[#71807A]/20 flex justify-between items-center">
                      <span className="text-xs text-[#283733] font-semibold uppercase">SIFT Copy-Move</span>
                      <Badge variant={latestVerification.layers?.tampering?.sift_copy_move_detected ? "FAIL" : "PASS"}>
                        {latestVerification.layers?.tampering?.sift_copy_move_detected ? "CLONE DETECTED" : "CLEAR"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FORENSICS */}
              {activeTab === "FORENSICS" && latestVerification.layers && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#71807A]">
                    Forensic Inspection Layers
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(latestVerification.layers).map(([layerKey, layerData]) => (
                      <ForensicLayerCard key={layerKey} layerKey={layerKey} layerData={layerData} />
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: AUDIT */}
              {activeTab === "AUDIT" && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#71807A]">
                    Officer Decisions & History
                  </h3>
                  <AuditTimeline
                    decisions={doc.reviewDecisions}
                    verifications={doc.verifications}
                  />
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

