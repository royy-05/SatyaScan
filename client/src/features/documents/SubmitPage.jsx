import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUpload } from "../../hooks/useUpload";
import { useSocket } from "../../hooks/useSocket";
import { documentsApi } from "./api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { PageHeader } from "../../components/ui/PageHeader";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Loader2, ShieldCheck, FileSearch } from "lucide-react";
import { toast } from "sonner";

export function SubmitPage() {
  const navigate = useNavigate();
  const { uploadDocument, uploading } = useUpload();
  const [docTypes, setDocTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("PASSPORT");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submittedDocId, setSubmittedDocId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const { lastEvent } = useSocket(submittedDocId);

  useEffect(() => {
    async function loadDocTypes() {
      try {
        const res = await documentsApi.getDocTypes();
        setDocTypes(res.data || []);
      } catch (_err) {
        // Fallback default list
        setDocTypes([
          { code: "PASSPORT", label: "Passport" },
          { code: "VISA", label: "Entry Visa" },
          { code: "NATIONAL_ID", label: "National Identity Card" },
          { code: "DRIVING_LICENSE", label: "Driving License" },
          { code: "PAN", label: "Permanent Account Number (PAN)" },
          { code: "PERMIT", label: "Special Border Pass / Permit" },
        ]);
      }
    }
    loadDocTypes();
  }, []);

  // Listen to Socket.IO events for live processing updates
  useEffect(() => {
    if (lastEvent) {
      if (lastEvent.status === "received") {
        setStatusMessage("Document received by server. Initiating verification pipeline...");
      } else if (lastEvent.status === "processing") {
        setStatusMessage(lastEvent.step || "Running AI layers (OCR, Validation, Tampering, Face Match)...");
      } else if (lastEvent.status === "done") {
        setStatusMessage("Verification complete!");
        toast.success("Verification finished!");
        const targetId = submittedDocId || lastEvent.documentId;
        if (targetId && targetId !== "null" && targetId !== "undefined") {
          setTimeout(() => {
            navigate(`/app/submissions/${targetId}/face-verify`);
          }, 1200);
        }
      } else if (lastEvent.status === "failed") {
        setStatusMessage(`Verification failed: ${lastEvent.error || "Unknown error"}`);
        toast.error("Document verification encountered an error");
      }
    }
  }, [lastEvent, submittedDocId, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a document image file");
      return;
    }

    try {
      setStatusMessage("Uploading file to secure vault...");
      const result = await uploadDocument(selectedFile, selectedType, idempotencyKey);
      const docId = result?.id || result?.data?.id;
      if (docId) {
        setSubmittedDocId(docId);
      }
      setStatusMessage("File stored. Waiting for AI engine status...");
    } catch (err) {
      setStatusMessage("Upload failed.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Document Scanning Workstation"
        description="Ingest passport, visa, or identity credential for AI multi-layer analysis."
        badge={<Badge variant="PASS">Ingestion Workstation</Badge>}
      />

      <Card className="p-6 space-y-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 border-b border-[#71807A]/20 pb-4">
            <h2 className="text-sm font-bold text-[#283733] uppercase tracking-wider">
              Document Type & Scan Ingestion
            </h2>
            <p className="text-xs text-[#71807A]">
              Select document type and attach high-resolution photo or scan.
            </p>
          </div>

          {/* Document Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#283733]">
              Document Category
            </label>
            <Select value={selectedType} onValueChange={setSelectedType} disabled={uploading || !!submittedDocId}>
              <SelectTrigger className="w-full bg-[#FCF5EE] border-[#71807A]/30">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#71807A]/30">
                {docTypes.map((dt) => (
                  <SelectItem key={dt.code} value={dt.code}>
                    {dt.label} ({dt.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Drag & Drop File Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#283733]">
              Document Image Scan (JPEG, PNG, WEBP, PDF - max 10MB)
            </label>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[#71807A]/40 hover:border-[#475853] rounded-md p-8 text-center bg-[#FCF5EE]/60 transition-colors cursor-pointer relative"
            >
              <input
                type="file"
                accept="image/jpeg,.jpg,.jpeg,image/png,image/webp,application/pdf,.pdf"
                onChange={handleFileChange}
                disabled={uploading || !!submittedDocId}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Selected document"
                    className="max-h-48 mx-auto rounded border border-[#71807A]/30 object-contain bg-white p-1"
                  />
                  <p className="text-xs font-bold text-[#283733] font-mono">{selectedFile?.name}</p>
                  <p className="text-[11px] text-[#71807A]">Click or drag a new image to replace</p>
                </div>
              ) : (
                <div className="space-y-3 pointer-events-none">
                  <div className="h-12 w-12 rounded bg-[#283733] text-[#DBCEB1] flex items-center justify-center mx-auto shadow-sm">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#283733]">
                      Drag & drop document scan image here
                    </p>
                    <p className="text-xs text-[#71807A] mt-1">or click to browse local files</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vertical Pipeline Verification Status */}
          {(uploading || submittedDocId) && (
            <div className="p-4 rounded-md border border-[#475853] bg-[#283733] text-[#FDF6F0] space-y-3 shadow-sm">
              <div className="flex items-center space-x-2 border-b border-[#475853] pb-2">
                <Loader2 className="h-4 w-4 text-[#DBCEB1] animate-spin shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#DBCEB1]">
                  AI Forensic Pipeline Active
                </span>
              </div>
              <p className="text-xs font-mono text-[#FDF6F0]">{statusMessage}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-[#71807A]/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/app/dashboard")}
              disabled={uploading || !!submittedDocId}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              disabled={!selectedFile || uploading || !!submittedDocId}
              className="px-6"
            >
              {uploading ? "Ingesting..." : "Execute Verification Pipeline"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

