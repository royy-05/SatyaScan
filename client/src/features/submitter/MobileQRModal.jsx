import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { Button } from "../../components/ui/Button";
import { Smartphone, X, ExternalLink, ShieldCheck } from "lucide-react";

export function MobileQRModal({ open, onClose }) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const mobileUrl = `${window.location.origin}/mobile-upload/${sessionId}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#0F172A] text-white border-slate-800 p-6 text-center">
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-800">
          <DialogTitle className="text-base font-bold flex items-center space-x-2 text-white">
            <Smartphone className="h-5 w-5 text-[#0FA891]" />
            <span>Switch to Mobile Device</span>
          </DialogTitle>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="py-6 space-y-6 flex flex-col items-center">
          <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
            Open the camera on your mobile phone, scan the QR code below to upload high-resolution photos directly from your phone camera.
          </p>

          <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-[#0FA891]/20">
            <QRCodeSVG value={mobileUrl} size={180} fgColor="#0F172A" level="H" includeMargin={true} />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-[#0FA891]">
              <ShieldCheck className="h-3 w-3" />
              <span>Mobile Handoff · Encrypted Session</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">Session ID: {sessionId.slice(0, 8)}...</p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-[#0FA891] underline underline-offset-4"
            >
              Or continue in browser
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MobileQRModal;
