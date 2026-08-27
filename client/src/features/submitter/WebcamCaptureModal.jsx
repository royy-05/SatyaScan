import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { Button } from "../../components/ui/Button";
import { Camera, RefreshCw, Check, X, ShieldCheck } from "lucide-react";

// Helper function to convert dataURL to File object
function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function WebcamCaptureModal({ open, onClose, onCapture }) {
  const webcamRef = useRef(null);
  const [capturedImg, setCapturedImg] = useState(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImg(imageSrc);
    }
  }, [webcamRef]);

  const handleRetake = () => {
    setCapturedImg(null);
  };

  const handleConfirm = () => {
    if (capturedImg) {
      const file = dataURLtoFile(capturedImg, `document_scan_${Date.now()}.jpg`);
      onCapture(file);
      setCapturedImg(null);
      onClose();
    }
  };

  const handleClose = () => {
    setCapturedImg(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl bg-[#0F172A] text-white border-slate-800 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-bold flex items-center space-x-2">
            <Camera className="h-5 w-5 text-[#0FA891]" />
            <span>Document Camera Capture</span>
          </DialogTitle>
          <button onClick={handleClose} className="text-slate-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {capturedImg ? (
              <img src={capturedImg} alt="Captured Document" className="w-full h-full object-contain" />
            ) : (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: "environment",
                }}
                className="w-full h-full object-cover"
              />
            )}

            {/* Document Guide Framing Overlay */}
            {!capturedImg && (
              <div className="absolute inset-6 border-2 border-dashed border-[#0FA891]/60 rounded-lg pointer-events-none flex flex-col justify-between p-4">
                <div className="text-[10px] font-mono text-[#0FA891] bg-slate-900/80 px-2 py-1 rounded w-fit">
                  ALIGN DOCUMENT WITHIN FRAME
                </div>
                <div className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded w-fit self-end">
                  HD CAMERA ACTIVE
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            {capturedImg ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRetake}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Retake Photo
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  className="bg-[#0FA891] hover:bg-[#0D8F7B] text-white font-bold"
                >
                  <Check className="h-4 w-4 mr-2" /> Use This Photo
                </Button>
              </>
            ) : (
              <>
                <p className="text-xs text-slate-400">Ensure good lighting and no glare on document</p>
                <Button
                  type="button"
                  onClick={capture}
                  className="bg-[#0FA891] hover:bg-[#0D8F7B] text-white font-bold px-6"
                >
                  <Camera className="h-4 w-4 mr-2" /> Capture Photo
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WebcamCaptureModal;
