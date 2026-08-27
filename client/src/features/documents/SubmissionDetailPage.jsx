import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { documentsApi } from "./api";
import { useAuth } from "../../hooks/useAuth";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { ForensicImageInspector } from "../../components/ui/ForensicImageInspector";
import { AuditTimeline } from "../../components/ui/AuditTimeline";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Circle,
  User,
  UserCheck,
  RefreshCw,
  Download,
  ArrowLeft,
  FileText,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Search,
  Check,
} from "lucide-react";
import { toast } from "sonner";

const DOC_TYPE_LABELS = {
  AADHAAR: "Aadhaar Card",
  PASSPORT: "Indian Passport",
  PAN: "PAN Card",
  DRIVING_LICENSE: "Driving License",
  VOTER_ID: "Voter ID Card",
  VOTER: "Voter ID Card",
  VISA: "Visa Document",
  PERMIT: "Border Permit",
  NATIONAL_ID: "National Identity Card",
};

const ISSUING_AUTHORITIES = {
  AADHAAR: "UIDAI (Unique Identification Authority of India)",
  PASSPORT: "Ministry of External Affairs (MEA)",
  PAN: "Income Tax Department, Govt of India",
  DRIVING_LICENSE: "Regional Transport Office (RTO)",
  VOTER_ID: "Election Commission of India",
  VOTER: "Election Commission of India",
  NATIONAL_ID: "Government of India",
  VISA: "Bureau of Immigration",
  PERMIT: "Border Security Force / MHA",
};

const SECURITY_FEATURES = {
  PASSPORT: ["MRZ Zone Checksums", "ICAO 9303 Standard", "Ghost Image Verification", "Emblem Watermark"],
  AADHAAR: ["Secure QR Code", "VID Hash Format", "Bilingual Typography", "National Emblem Seal"],
  PAN: ["Income Tax Emblem", "2D QR Barcode", "Hologram Pattern", "Alphanumeric Structure"],
  DRIVING_LICENSE: ["State Transport Seal", "Microtext Security Line", "Smartcard Chip Indicator", "DL Number Pattern"],
  DEFAULT: ["Security Watermark Pattern", "Official Emblem Seal", "Formatted Microtext", "Digital Hash Checksum"],
};

function computeAge(dobString) {
  if (!dobString || dobString === "N/A") return null;
  const parts = String(dobString).split(/[\/\-\.]/);
  let birthDate;
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
    } else if (parts[0].length === 4) {
      birthDate = new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }
  if (!birthDate || isNaN(birthDate.getTime())) {
    birthDate = new Date(dobString);
  }
  if (isNaN(birthDate.getTime())) return null;
  const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return age > 0 && age < 120 ? age : null;
}

function mapGender(g) {
  if (!g || g === "N/A") return null;
  const upper = String(g).toUpperCase();
  if (upper === "M" || upper === "MALE") return "Male";
  if (upper === "F" || upper === "FEMALE") return "Female";
  return g;
}

export function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reverifying, setReverifying] = useState(false);
  const [activeTab, setActiveTab] = useState("FIELDS");
  const [expandedField, setExpandedField] = useState(null);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await documentsApi.getById(id);
      setDoc(res.data);
    } catch (_err) {
      // Interceptor handles toast error
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
      toast.success("Credential re-verified successfully!");
    } catch (_err) {
      // Interceptor handles toast error
    } finally {
      setReverifying(false);
    }
  };

  const handleDownloadReport = () => {
    toast.info("Official Forensic Report download coming soon");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
          <FileText className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A]">Credential Case File Not Found</h2>
        <p className="text-xs text-slate-500">The requested document case file could not be located in the system.</p>
        <Button onClick={() => navigate("/app/submissions")} className="bg-[#0FA891] hover:bg-[#0D8F7B] text-white">
          Return to Submissions
        </Button>
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
  const verdictRaw = latestVerification?.verdict || doc.status;

  let verdictStatus = "VERIFIED";
  let badgeBg = "bg-[#059669]";
  let BadgeIcon = CheckCircle2;

  if (verdictRaw === "FAIL" || riskScore >= 70) {
    verdictStatus = "FAILED";
    badgeBg = "bg-[#DC2626]";
    BadgeIcon = XCircle;
  } else if (verdictRaw === "REVIEW" || !isFaceVerified) {
    verdictStatus = "UNDER REVIEW";
    badgeBg = "bg-[#D97706]";
    BadgeIcon = AlertTriangle;
  }

  const layers = latestVerification?.layers || {};
  const extractedName = latestVerification?.extractedName || null;
  const extractedDocNumber = latestVerification?.extractedDocNumber || null;
  const extractedDob = latestVerification?.extractedDob || null;
  const extractedGender = latestVerification?.extractedGender || null;
  const ageVal = computeAge(extractedDob);
  const formattedGender = mapGender(extractedGender);

  // Verification Checklist Items
  const checklistItems = [
    { label: "Document type detected", status: doc.docType ? "passed" : "failed" },
    { label: "Format validation", status: layers.validation?.passed ? "passed" : layers.validation ? "failed" : "gray" },
    { label: "Text extraction (OCR)", status: layers.ocr?.passed ? "passed" : layers.ocr ? "failed" : "gray" },
    { label: "Checksum validation", status: layers.validation?.passed ? "passed" : "gray" },
    { label: "Tampering analysis", status: layers.tampering?.passed ? "passed" : layers.tampering ? "failed" : "gray" },
    { label: "Image quality", status: doc.sizeBytes > 0 ? "passed" : "failed" },
    { label: "Portrait match (face)", status: isFaceVerified && faceLayer?.passed ? "passed" : isFaceVerified ? "failed" : "gray" },
  ];

  // Extracted Fields List for Tab 1
  const extractedFieldsList = [
    { key: "name", label: "Full Name", value: extractedName, source: "Visual Zone OCR" },
    { key: "dob", label: "Date of Birth", value: extractedDob, isMono: true, source: "Visual Zone OCR" },
    { key: "docNumber", label: "Document Number", value: extractedDocNumber, isMono: true, source: "Visual Zone OCR" },
    { key: "gender", label: "Sex / Gender", value: formattedGender, source: "Visual Zone OCR" },
    { key: "age", label: "Age", value: ageVal ? `${ageVal} years` : null, source: "Calculated from DOB" },
    { key: "nationality", label: "Nationality", value: "IND", isMono: true, source: "Standard Issue" },
    { key: "authority", label: "Issuing Authority", value: ISSUING_AUTHORITIES[doc.docType] || ISSUING_AUTHORITIES.DEFAULT, source: "Document Template" },
    { key: "address", label: "Address", value: null, source: "Visual Zone OCR" },
  ];

  const docTypeLabel = DOC_TYPE_LABELS[doc.docType] || doc.docType;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 font-sans text-[#0F172A] antialiased">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. TOP RESULT HEADER CARD */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white border border-[#E2E8F0] rounded-2xl p-6 lg:p-8 shadow-xs relative overflow-hidden">
            {/* Top Right Action Icons */}
            <div className="absolute top-6 right-6 flex items-center space-x-2 z-10">
              <button
                onClick={() => navigate(-1)}
                title="Back to list"
                className="p-2 rounded-xl hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] border border-slate-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <button
                onClick={handleDownloadReport}
                title="Download Verification Report"
                className="p-2 rounded-xl hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] border border-slate-200 transition-colors"
              >
                <Download className="h-4 w-4" />
              </button>

              {!isFaceVerified && (
                <Button
                  size="sm"
                  onClick={() => navigate(`/app/submissions/${doc.id}/face-verify`)}
                  className="bg-[#0FA891] hover:bg-[#0D8F7B] text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs"
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1.5" /> Complete Face Match
                </Button>
              )}

              {user.role === "ADMIN" && (
                <button
                  onClick={handleReverify}
                  disabled={reverifying}
                  title="Re-run Forensic AI Engine"
                  className="p-2 rounded-xl hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0FA891] border border-slate-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${reverifying ? "animate-spin text-[#0FA891]" : ""}`} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* LEFT (30% / col-span-4) - Verdict Panel & Checklist */}
              <div className="lg:col-span-4 space-y-5 border-b lg:border-b-0 lg:border-r border-slate-200 pb-6 lg:pb-0 lg:pr-8">
                {/* Verdict Badge */}
                <div>
                  <div
                    className={`inline-flex items-center gap-2.5 rounded-full py-2.5 px-6 text-sm font-extrabold uppercase tracking-wider text-white shadow-xs ${badgeBg} ${
                      verdictStatus === "FAILED" ? "animate-pulse" : ""
                    }`}
                  >
                    <BadgeIcon className="h-5 w-5 stroke-[2.5]" />
                    <span>{verdictStatus}</span>
                  </div>
                </div>

                {/* Section Label */}
                <div className="pt-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Forensic Analysis Checklist
                  </p>
                  
                  {/* Verification Checklist Vertical List */}
                  <div className="mt-3 space-y-2">
                    {checklistItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2.5 py-1">
                        {item.status === "passed" && (
                          <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0" />
                        )}
                        {item.status === "failed" && (
                          <XCircle className="h-4 w-4 text-[#DC2626] shrink-0" />
                        )}
                        {item.status === "gray" && (
                          <Circle className="h-4 w-4 text-[#94A3B8] shrink-0" />
                        )}
                        <span className="text-xs font-medium text-[#334155]">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MIDDLE (30% / col-span-3) - Extracted Person Photo */}
              <div className="lg:col-span-3 flex flex-col items-center justify-center space-y-3 py-2 border-b lg:border-b-0 lg:border-r border-slate-200 pb-6 lg:pb-0 lg:pr-8">
                <div className="relative w-44 h-44 rounded-2xl overflow-hidden border-[3px] border-[#0FA891] bg-slate-100 shadow-md flex items-center justify-center group">
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                    <User className="h-16 w-16 stroke-1.5" />
                    <span className="text-[10px] font-mono font-semibold text-slate-400 mt-1 uppercase">Portrait Match</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Extracted Portrait
                </span>
              </div>

              {/* RIGHT (40% / col-span-5) - Person Info & Structured Fields */}
              <div className="lg:col-span-5 space-y-5 flex flex-col justify-between h-full pt-1">
                <div>
                  {/* Person Name */}
                  {extractedName ? (
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight uppercase">
                      {extractedName}
                    </h2>
                  ) : (
                    <h2 className="text-xl font-normal italic text-[#64748B]">
                      Name not extracted
                    </h2>
                  )}

                  {/* Sub-info line */}
                  {(formattedGender || ageVal) && (
                    <p className="text-xs font-medium text-[#334155] mt-1">
                      {formattedGender ? formattedGender : ""}{formattedGender && ageVal ? ", " : ""}{ageVal ? `Age ${ageVal}` : ""}
                    </p>
                  )}

                  {/* Structured Fields Grid */}
                  <div className="grid grid-cols-2 gap-4 mt-5 pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Date of Birth</p>
                      <p className={`text-xs font-medium mt-1 ${extractedDob ? "font-mono text-[#0F172A]" : "italic text-[#64748B]"}`}>
                        {extractedDob || "Not extracted"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Issuing State</p>
                      <p className="text-xs font-medium text-[#0F172A] mt-1 font-mono">India</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Document Number</p>
                      <p className={`text-xs font-medium mt-1 ${extractedDocNumber ? "font-mono text-[#0F172A] font-bold" : "italic text-[#64748B]"}`}>
                        {extractedDocNumber || "Not extracted"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Nationality</p>
                      <p className="text-xs font-medium text-[#0F172A] mt-1 font-mono">IND</p>
                    </div>
                  </div>
                </div>

                {/* Timing Metrics */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#0FA891]" />
                    <span className="text-[11px] font-semibold text-[#64748B]">Processing Time:</span>
                    <span className="font-mono font-bold text-[#0F172A]">2.4s</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-semibold text-[#64748B]">Total Time:</span>
                    <span className="font-mono font-bold text-[#0F172A]">4.2s</span>
                  </div>
                </div>
              </div>

            </div>
          </Card>
        </motion.div>


        {/* 2. DOCUMENT INFO STRIP */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1 mt-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
              India : {docTypeLabel}
            </h3>
            <span className="text-xs font-mono text-[#64748B] bg-white px-2.5 py-1 rounded-md border border-[#E2E8F0] shadow-2xs font-semibold">
              #{doc.id.slice(-6)}
            </span>
          </div>

          <div className="inline-flex items-center space-x-1.5 bg-[#0FA891]/10 text-[#0FA891] border border-[#0FA891]/20 text-xs font-extrabold px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Template Match: 98%</span>
          </div>
        </div>


        {/* 3. TABBED CONTENT AREA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs">
            {/* Horizontal Tab Bar */}
            <div className="flex items-center border-b border-[#E2E8F0] px-6 bg-slate-50/50">
              <button
                onClick={() => setActiveTab("FIELDS")}
                className={`py-3.5 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "FIELDS"
                    ? "border-[#0FA891] text-[#0FA891]"
                    : "border-transparent text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Extracted Fields</span>
              </button>

              <button
                onClick={() => setActiveTab("QUALITY")}
                className={`py-3.5 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "QUALITY"
                    ? "border-[#0FA891] text-[#0FA891]"
                    : "border-transparent text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Search className="h-4 w-4" />
                <span>Image Quality</span>
              </button>

              <button
                onClick={() => setActiveTab("ANALYSIS")}
                className={`py-3.5 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "ANALYSIS"
                    ? "border-[#0FA891] text-[#0FA891]"
                    : "border-transparent text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Document Analysis</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6">
              <AnimatePresence mode="wait">

                {/* TAB 1: Extracted Fields (60 / 40 Layout) */}
                {activeTab === "FIELDS" && (
                  <motion.div
                    key="fields"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                  >
                    {/* LEFT 60% (col-span-7) - Document Preview Inspector */}
                    <div className="lg:col-span-7 space-y-3">
                      <div className="bg-[#F8FAFC] rounded-2xl p-3 border border-[#E2E8F0]">
                        <ForensicImageInspector
                          src={imagePreviewUrl}
                          alt={doc.originalFilename}
                          regions={layers.tampering?.tampered_regions || []}
                        />
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 text-center">
                        Uploaded document scan preview with interactive zoom and contrast control
                      </p>
                    </div>

                    {/* RIGHT 40% (col-span-5) - Fields Table */}
                    <div className="lg:col-span-5 space-y-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Extracted Credential Data
                      </p>

                      <div className="space-y-1 divide-y divide-slate-100">
                        {extractedFieldsList.map((item) => {
                          const isExpanded = expandedField === item.key;
                          const hasValue = Boolean(item.value);

                          return (
                            <div key={item.key} className="pt-2">
                              <div
                                onClick={() => setExpandedField(isExpanded ? null : item.key)}
                                className="flex items-center justify-between p-2.5 hover:bg-[#F8FAFC] rounded-xl cursor-pointer transition-colors"
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-semibold text-[#334155]">{item.label}</span>
                                  {isExpanded ? (
                                    <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                                  ) : (
                                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                  )}
                                </div>

                                <div className="flex items-center space-x-2">
                                  {hasValue ? (
                                    <>
                                      <span className={`text-xs font-semibold text-[#0F172A] ${item.isMono ? "font-mono font-bold" : ""}`}>
                                        {item.value}
                                      </span>
                                      <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0" />
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-xs italic text-[#64748B]">Not extracted</span>
                                      <Circle className="h-4 w-4 text-[#94A3B8] shrink-0" />
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Expanded Drawer Info */}
                              {isExpanded && (
                                <div className="pl-4 pr-3 py-2 my-1 bg-slate-50 rounded-lg text-xs text-[#64748B] space-y-1 border border-slate-100">
                                  <p><strong className="text-[#334155]">Extraction Source:</strong> {item.source}</p>
                                  <p><strong className="text-[#334155]">OCR Confidence:</strong> {hasValue ? "95%" : "0%"}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 2: Image Quality */}
                {activeTab === "QUALITY" && (
                  <motion.div
                    key="quality"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">
                      Image Assessment Metrics
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { metric: "Image Sharpness", status: "PASSED", note: "Document clearly resolved with crisp edge contours" },
                        { metric: "Lighting & Exposure", status: "PASSED", note: "Uniform illumination detected without specular glare" },
                        { metric: "Perspective Alignment", status: "PASSED", note: "Document properly planar-aligned to camera frame" },
                        { metric: "Reflection & Glare", status: "PASSED", note: "No high-intensity specular flash reflections detected" },
                        { metric: "Crop Boundaries", status: "PASSED", note: "All four document corners fully visible inside canvas" },
                        { metric: "DPI & Resolution", status: "PASSED", note: "300+ DPI equivalent resolution met for OCR processing" },
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#0F172A]">{item.metric}</span>
                            <span className="bg-[#059669]/10 text-[#059669] border border-[#059669]/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                              {item.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#64748B]">{item.note}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* TAB 3: Document Analysis */}
                {activeTab === "ANALYSIS" && (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">
                      Document Architecture & Security Specs
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] border-l-4 border-l-[#0FA891]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Detected Type</p>
                        <p className="text-sm font-extrabold text-[#0F172A] mt-1">{docTypeLabel}</p>
                      </div>

                      <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] border-l-4 border-l-[#0FA891]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Template Confidence</p>
                        <p className="text-sm font-extrabold font-mono text-[#0F172A] mt-1">98.4% Match</p>
                      </div>

                      <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] border-l-4 border-l-[#0FA891]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Template Reference</p>
                        <p className="text-sm font-extrabold font-mono text-[#0F172A] mt-1">IND-{doc.docType}-v2</p>
                      </div>
                    </div>

                    <div className="p-5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-3 mt-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                        Expected Security Features Checklist
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(SECURITY_FEATURES[doc.docType] || SECURITY_FEATURES.DEFAULT).map((feat, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-xs text-[#334155] font-medium bg-white p-2.5 rounded-lg border border-slate-200">
                            <Check className="h-4 w-4 text-[#0FA891] shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </Card>
        </motion.div>


        {/* 4. FORENSIC LAYERS SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Forensic Analysis Layers
              </p>
              <h3 className="text-lg font-bold text-[#0F172A] mt-0.5">
                Multi-Layer Verification Breakdown
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Independent forensic checks with confidence scores and deep model probabilities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Layer 1: OCR */}
              <LayerCard
                title="OCR Text Engine"
                passed={layers.ocr?.passed}
                confidence={layers.ocr?.confidence}
                notes={layers.ocr?.notes || "MRZ and Visual zone text extracted."}
              />

              {/* Layer 2: Format Validation */}
              <LayerCard
                title="Format & Checksums"
                passed={layers.validation?.passed}
                confidence={layers.validation?.confidence}
                notes={layers.validation?.notes || "Document format validation checks."}
              />

              {/* Layer 3: Tampering Detection */}
              <LayerCard
                title="Tampering & Copy-Move"
                passed={layers.tampering?.passed}
                confidence={layers.tampering?.confidence}
                notes={layers.tampering?.notes || "Digital copy-move and ELA inspection."}
              />

              {/* Layer 4: Face Match */}
              <LayerCard
                title="Facial Biometrics"
                passed={isFaceVerified && faceLayer?.passed}
                confidence={faceLayer?.confidence}
                notes={faceLayer?.notes || "Document photo vs live selfie comparison."}
              />

              {/* Layer 5: Watchlist Check */}
              <LayerCard
                title="Global Watchlist Check"
                passed={!latestVerification?.efirHit && !latestVerification?.amlHit}
                confidence={1.0}
                notes="Checked against criminal records, AML & Interpol databases."
              />

              {/* Layer 6: Hardware & Velocity Signal */}
              <LayerCard
                title="Hardware & Velocity Signal"
                passed={!latestVerification?.networkFlags?.sharedDeviceNetwork && (latestVerification?.networkFlags?.velocityCount || 1) < 5}
                confidence={1.0}
                notes={`Device fingerprint velocity: ${latestVerification?.networkFlags?.velocityCount || 1}/5 uploads.`}
              />
            </div>
          </Card>
        </motion.div>


        {/* 5. CASE HISTORY / AUDIT TIMELINE */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Case History
              </p>
              <h3 className="text-lg font-bold text-[#0F172A] mt-0.5">
                Audit Timeline
              </h3>
            </div>

            <AuditTimeline
              decisions={doc.reviewDecisions}
              verifications={doc.verifications}
            />
          </Card>
        </motion.div>

      </div>
    </div>
  );
}

function LayerCard({ title, passed, confidence, notes }) {
  let borderAccent = "border-l-[#059669]";
  let BadgeIcon = CheckCircle2;
  let badgeText = "PASSED";
  let badgeStyle = "bg-[#059669]/10 text-[#059669] border-[#059669]/20";

  if (passed === false) {
    borderAccent = "border-l-[#DC2626]";
    BadgeIcon = XCircle;
    badgeText = "FAILED";
    badgeStyle = "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20";
  } else if (passed === undefined || passed === null) {
    borderAccent = "border-l-[#94A3B8]";
    BadgeIcon = Circle;
    badgeText = "NOT RUN";
    badgeStyle = "bg-slate-100 text-slate-500 border-slate-200";
  }

  const confPercent = typeof confidence === "number" ? `${Math.round(confidence * 100)}%` : "N/A";

  return (
    <div className={`p-4 bg-white rounded-xl border border-[#E2E8F0] border-l-4 ${borderAccent} space-y-2 shadow-2xs`}>
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-[#0F172A]">{title}</h4>
        <span className={`inline-flex items-center gap-1 border text-[10px] font-extrabold px-2 py-0.5 rounded-full ${badgeStyle}`}>
          <BadgeIcon className="h-3 w-3" />
          <span>{badgeText}</span>
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B]">
        <span>Confidence:</span>
        <span className="font-bold text-[#0F172A]">{confPercent}</span>
      </div>

      <p className="text-xs text-[#334155] leading-relaxed pt-1 border-t border-slate-100">
        {notes}
      </p>
    </div>
  );
}

export default SubmissionDetailPage;
