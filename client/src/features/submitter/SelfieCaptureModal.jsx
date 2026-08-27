import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { Button } from "../../components/ui/Button";
import { Camera, RefreshCw, Check, X, UserCheck, Sun, Glasses, Eye } from "lucide-react";

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

export function SelfieCaptureModal({ open, onClose, onCapture }) {
  const webcamRef = useRef(null);
  const [capturedImg, setCapturedImg] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImg(imageSrc);
    }
  }, [webcamRef]);

  const startCountdown = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      capture();
      setCountdown(null);
    }
  }, [countdown, capture]);

  const handleRetake = () => {
    setCapturedImg(null);
    setCountdown(null);
  };

  const handleConfirm = () => {
    if (capturedImg) {
      const file = dataURLtoFile(capturedImg, `live_selfie_${Date.now()}.jpg`);
      onCapture(file);
      setCapturedImg(null);
      onClose();
    }
  };

  const handleClose = () => {
    setCapturedImg(null);
    setCountdown(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl bg-[#0F172A] text-white border-slate-800 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-bold flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-[#0FA891]" />
            <span>Live Face Biometric Capture</span>
          </DialogTitle>
          <button onClick={handleClose} className="text-slate-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="relative w-full aspect-square max-w-sm mx-auto bg-black rounded-full overflow-hidden border-2 border-[#0FA891] flex items-center justify-center shadow-lg">
            {capturedImg ? (
              <img src={capturedImg} alt="Captured Selfie" className="w-full h-full object-cover rounded-full" />
            ) : (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 720,
                  height: 720,
                  facingMode: "user",
                }}
                className="w-full h-full object-cover"
              />
            )}

            {/* Oval Face Guide Overlay */}
            {!capturedImg && (
              <div className="absolute inset-4 border-2 border-dashed border-[#0FA891] rounded-full pointer-events-none flex flex-col items-center justify-center p-4">
                {countdown !== null ? (
                  <div className="text-6xl font-extrabold text-[#0FA891] animate-ping font-mono">
                    {countdown}
                  </div>
                ) : (
                  <span className="text-[11px] font-mono font-bold text-[#0FA891] bg-slate-900/80 px-2 py-1 rounded text-center">
                    CENTER FACE HERE
                  </span>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-center text-slate-300 font-medium">
            Position your face inside the circle. Look directly at the camera.
          </p>

          {/* Regula-style Tips */}
          <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 text-center">
            <div className="flex flex-col items-center space-y-1">
              <Sun className="h-4 w-4 text-[#0FA891]" />
              <span>Good Illumination</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Glasses className="h-4 w-4 text-[#0FA891]" />
              <span>No Accessories</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Eye className="h-4 w-4 text-[#0FA891]" />
              <span>Camera at Eye Level</span>
            </div>
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
                  <RefreshCw className="h-4 w-4 mr-2" /> Retake Selfie
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  className="bg-[#0FA891] hover:bg-[#0D8F7B] text-white font-bold"
                >
                  <Check className="h-4 w-4 mr-2" /> Use This Selfie
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={startCountdown}
                  disabled={countdown !== null}
                  className="bg-[#0FA891] hover:bg-[#0D8F7B] text-white font-bold px-6"
                >
                  <Camera className="h-4 w-4 mr-2" /> Take Selfie
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SelfieCaptureModal;
