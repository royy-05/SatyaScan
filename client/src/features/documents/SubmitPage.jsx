import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUpload } from "../../hooks/useUpload";
import { useSocket } from "../../hooks/useSocket";
import { documentsApi } from "./api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
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
            navigate(`/app/submissions/${targetId}`);
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
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-100">Submit Document for Verification</h1>
        <p className="text-sm text-slate-400">
          Upload passport, visa, or identity pass for AI multi-layer analysis.
        </p>
      </div>

      <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-lg">Document Details & Image Upload</CardTitle>
            <CardDescription>Select document type and attach high-resolution photo or scan.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Document Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Document Type</label>
              <Select value={selectedType} onValueChange={setSelectedType} disabled={uploading || !!submittedDocId}>
                <SelectTrigger className="w-full bg-slate-950">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {docTypes.map((dt) => (
                    <SelectItem key={dt.code} value={dt.code}>
                      {dt.label} ({dt.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Drag & Drop File Area */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Document Image (JPEG, PNG, WEBP, max 10MB)</label>
              
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-8 text-center bg-slate-950/50 transition-colors cursor-pointer relative"
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp, application/pdf,.pdf"
                  onChange={handleFileChange}
                  disabled={uploading || !!submittedDocId}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {previewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={previewUrl}
                      alt="Selected document"
                      className="max-h-48 mx-auto rounded-lg border border-slate-700 object-contain"
                    />
                    <p className="text-xs text-slate-300 font-medium">{selectedFile?.name}</p>
                    <p className="text-[11px] text-slate-500">Click or drag a new image to replace</p>
                  </div>
                ) : (
                  <div className="space-y-3 pointer-events-none">
                    <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-cyan-400">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Drag & drop document image here</p>
                      <p className="text-xs text-slate-400 mt-1">or click to browse local files</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Socket Status Message */}
            {(uploading || submittedDocId) && (
              <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 flex items-center space-x-3 bg-cyan-950/20">
                <Loader2 className="h-5 w-5 text-cyan-400 animate-spin shrink-0" />
                <div className="text-xs space-y-0.5">
                  <p className="font-semibold text-cyan-300">Live AI Verification Status</p>
                  <p className="text-slate-300">{statusMessage}</p>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end space-x-3 border-t border-slate-800 pt-4">
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
              disabled={!selectedFile || uploading || !!submittedDocId}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
            >
              {uploading ? "Uploading..." : "Submit for Verification"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
