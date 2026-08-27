import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUpload } from "../../hooks/useUpload";
import { documentsApi } from "../documents/api";
import { Button } from "../../components/ui/Button";
import { WebcamCaptureModal } from "./WebcamCaptureModal";
import { SelfieCaptureModal } from "./SelfieCaptureModal";
import { MobileQRModal } from "./MobileQRModal";
import {
  FileText,
  CreditCard,
  IdCard,
  Camera,
  Smartphone,
  Upload,
  UserCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  FileScan,
  AlertCircle,
  ScanLine,
} from "lucide-react";
import { toast } from "sonner";

const DOC_TYPES = [
  { code: "PASSPORT", label: "Passport", icon: FileText },
  { code: "AADHAAR", label: "Aadhaar", icon: CreditCard },
  { code: "PAN", label: "PAN Card", icon: CreditCard },
  { code: "DRIVING_LICENSE", label: "Driving License", icon: IdCard },
  { code: "VOTER", label: "Voter ID", icon: FileText },
];

export function SubmitterScanPage() {
  const navigate = useNavigate();
  const { uploadDocument, uploading } = useUpload();

  const [selectedType, setSelectedType] = useState("PASSPORT");
  const [docFile, setDocFile] = useState(null);
  const [docPreview, setDocPreview] = useState(null);

  const [selfieFile, setSelfieFile] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);

  // Modals state
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [isSelfieOpen, setIsSelfieOpen] = useState(false);
  const [isMobileQROpen, setIsMobileQROpen] = useState(false);

  // Submission pipeline state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);

  const docInputRef = useRef(null);
  const selfieInputRef = useRef(null);

  const PIPELINE_STEPS = [
    "Uploading document...",
    "OCR extraction...",
    "Format validation...",
    "Tampering detection...",
    "Face verification...",
    "Generating verdict...",
  ];

  // Document file selection
  const handleDocFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Document file size exceeds 10MB limit");
        return;
      }
      setDocFile(file);
      setDocPreview(URL.createObjectURL(file));
    }
  };

  // Selfie file selection
  const handleSelfieFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Selfie file size exceeds 10MB limit");
        return;
      }
      setSelfieFile(file);
      setSelfiePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveDoc = () => {
    setDocFile(null);
    setDocPreview(null);
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const handleRemoveSelfie = () => {
    setSelfieFile(null);
    setSelfiePreview(null);
    if (selfieInputRef.current) selfieInputRef.current.value = "";
  };

  // Handle Submit & Pipeline Animation
  const handleVerify = async () => {
    if (!docFile || !selfieFile) {
      toast.error("Please provide both document image and live selfie");
      return;
    }

    setIsSubmitting(true);
    setPipelineStep(0);

    try {
      // Step 1: Uploading document
      setPipelineStep(0);
      const docTypeMap = {
        PASSPORT: "PASSPORT",
        AADHAAR: "NATIONAL_ID",
        PAN: "PAN",
        DRIVING_LICENSE: "DRIVING_LICENSE",
        VOTER: "NATIONAL_ID",
      };
      const apiDocType = docTypeMap[selectedType] || selectedType;
      const res = await uploadDocument(docFile, apiDocType);
      const documentId = res.id || res.documentId || res.data?.id;

      // Step 2: OCR extraction
      setPipelineStep(1);
      await new Promise((r) => setTimeout(r, 600));

      // Step 3: Format validation
      setPipelineStep(2);
      await new Promise((r) => setTimeout(r, 500));

      // Step 4: Tampering detection
      setPipelineStep(3);
      await new Promise((r) => setTimeout(r, 600));

      // Step 5: Face verification (calls /face-verify endpoint with selfie)
      setPipelineStep(4);
      if (documentId && selfieFile) {
        const formData = new FormData();
        formData.append("selfie", selfieFile);
        await documentsApi.faceVerify(documentId, formData);
      }

      // Step 6: Generating verdict
      setPipelineStep(5);
      await new Promise((r) => setTimeout(r, 500));

      toast.success("Verification complete!");
      navigate(`/app/submissions/${documentId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Verification submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = Boolean(docFile && selfieFile && !isSubmitting && !uploading);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] p-4 lg:p-8 font-sans text-[#0F172A]">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER SECTION */}
        <div className="space-y-1 text-left border-b border-slate-200 pb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0FA891]/10 text-[#0FA891] text-xs font-semibold tracking-wide mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Ministry of Home Affairs · SSB Border Control</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0F172A]">
            Credential Verification Station
          </h1>
          <p className="text-sm lg:text-base text-slate-600">
            Upload identity document and live selfie to begin real-time AI forensic verification.
          </p>
        </div>

        {/* STEP 1: DOCUMENT TYPE SELECTOR */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
            STEP 1: SELECT DOCUMENT TYPE
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {DOC_TYPES.map((type) => {
              const IconComp = type.icon;
              const isSelected = selectedType === type.code;
              return (
                <button
                  key={type.code}
                  type="button"
                  onClick={() => setSelectedType(type.code)}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                    isSelected
                      ? "bg-[#0FA891] border-[#0FA891] text-white shadow-md scale-[1.02]"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <IconComp className={`h-4 w-4 ${isSelected ? "text-white" : "text-[#0FA891]"}`} />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: TWO-COLUMN UPLOADER SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* COLUMN 1: DOCUMENT IMAGE CARD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  DOCUMENT IMAGE
                </label>
                {docFile && (
                  <span className="text-xs font-mono font-semibold text-[#0FA891] bg-[#0FA891]/10 px-2 py-0.5 rounded-full">
                    READY
                  </span>
                )}
              </div>

              {/* Document Display Area */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-[#F8FAFC] min-h-[220px] flex items-center justify-center relative overflow-hidden">
                {docPreview ? (
                  <div className="relative w-full h-full min-h-[200px] flex flex-col items-center justify-center">
                    <img
                      src={docPreview}
                      alt="Document Preview"
                      className="max-h-[180px] w-auto object-contain rounded-lg shadow-sm"
                    />
                    <div className="mt-3 text-center">
                      <p className="text-xs font-semibold text-[#0F172A] truncate max-w-[240px]">
                        {docFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {(docFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveDoc}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-md transition-colors"
                      title="Remove Document"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-2 py-4">
                    <FileScan className="h-12 w-12 text-[#0FA891] mx-auto opacity-80" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[#0F172A]">Document Image</p>
                      <p className="text-xs text-slate-500">
                        Passport, Aadhaar, PAN, DL, or Voter ID
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Document Input Actions */}
            <div className="space-y-2.5 pt-2">
              <input
                ref={docInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleDocFileChange}
                className="hidden"
              />

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsWebcamOpen(true)}
                  className="border-slate-200 hover:border-[#0FA891] hover:text-[#0FA891] text-xs font-semibold py-2.5"
                >
                  <Camera className="h-3.5 w-3.5 mr-1.5 text-[#0FA891]" /> Take Photo
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMobileQROpen(true)}
                  className="border-slate-200 hover:border-[#0FA891] hover:text-[#0FA891] text-xs font-semibold py-2.5"
                >
                  <Smartphone className="h-3.5 w-3.5 mr-1.5 text-[#0FA891]" /> Use Mobile
                </Button>
              </div>

              <Button
                type="button"
                onClick={() => docInputRef.current?.click()}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs"
              >
                <Upload className="h-3.5 w-3.5 mr-2" /> Upload File from Computer
              </Button>
            </div>
          </div>

          {/* COLUMN 2: LIVE SELFIE CARD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  LIVE SELFIE
                </label>
                {selfieFile && (
                  <span className="text-xs font-mono font-semibold text-[#0FA891] bg-[#0FA891]/10 px-2 py-0.5 rounded-full">
                    READY
                  </span>
                )}
              </div>

              {/* Selfie Display Area */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-[#F8FAFC] min-h-[220px] flex items-center justify-center relative overflow-hidden">
                {selfiePreview ? (
                  <div className="relative w-full h-full min-h-[200px] flex flex-col items-center justify-center">
                    <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-[#0FA891] shadow-md mb-2">
                      <img
                        src={selfiePreview}
                        alt="Selfie Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-[#0F172A] truncate max-w-[240px]">
                        {selfieFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {(selfieFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveSelfie}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-md transition-colors"
                      title="Remove Selfie"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-2 py-4">
                    <UserCircle2 className="h-12 w-12 text-[#0FA891] mx-auto opacity-80" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[#0F172A]">Live Selfie</p>
                      <p className="text-xs text-slate-500">
                        Face verification requires a live selfie
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Selfie Input Actions */}
            <div className="space-y-2.5 pt-2">
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleSelfieFileChange}
                className="hidden"
              />

              <Button
                type="button"
                onClick={() => setIsSelfieOpen(true)}
                className="w-full bg-[#0FA891] hover:bg-[#0D8F7B] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs"
              >
                <Camera className="h-3.5 w-3.5 mr-2" /> Take Live Selfie
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => selfieInputRef.current?.click()}
                className="w-full border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs py-2.5 rounded-xl"
              >
                <Upload className="h-3.5 w-3.5 mr-2 text-slate-500" /> Upload Image File
              </Button>
            </div>
          </div>
        </div>

        {/* STEP 3: SUBMIT BUTTON */}
        <div className="pt-4">
          <Button
            type="button"
            onClick={handleVerify}
            disabled={!canSubmit}
            className={`w-full py-4 text-base font-extrabold rounded-2xl shadow-md transition-all duration-200 flex items-center justify-center space-x-2 ${
              canSubmit
                ? "bg-[#0FA891] hover:bg-[#0D8F7B] text-white hover:scale-[1.005]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <span>VERIFY CREDENTIAL</span>
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* MODALS */}
      <WebcamCaptureModal
        open={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={(file) => {
          setDocFile(file);
          setDocPreview(URL.createObjectURL(file));
        }}
      />

      <SelfieCaptureModal
        open={isSelfieOpen}
        onClose={() => setIsSelfieOpen(false)}
        onCapture={(file) => {
          setSelfieFile(file);
          setSelfiePreview(URL.createObjectURL(file));
        }}
      />

      <MobileQRModal open={isMobileQROpen} onClose={() => setIsMobileQROpen(false)} />

      {/* FULL-SCREEN PIPELINE OVERLAY WHEN SUBMITTING */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white">
          <div className="bg-[#0F172A] border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <Loader2 className="w-16 h-16 text-[#0FA891] animate-spin" />
              <ShieldCheck className="w-8 h-8 text-white absolute" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                Analyzing Credential...
              </h3>
              <p className="text-xs text-slate-400">
                Running SatyaScan Forensic AI Pipeline
              </p>
            </div>

            {/* Pipeline Step Progress */}
            <div className="space-y-2.5 text-left bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              {PIPELINE_STEPS.map((stepLabel, idx) => {
                const isCurrent = pipelineStep === idx;
                const isDone = pipelineStep > idx;
                return (
                  <div key={stepLabel} className="flex items-center space-x-3 text-xs">
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-[#0FA891] flex-shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 text-[#0FA891] animate-spin flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-700 flex-shrink-0" />
                    )}
                    <span
                      className={
                        isDone
                          ? "text-slate-300 font-medium"
                          : isCurrent
                          ? "text-white font-bold"
                          : "text-slate-600"
                      }
                    >
                      {stepLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubmitterScanPage;
