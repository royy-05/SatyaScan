import React from "react";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";

export function ForensicLayerCard({ layerKey, layerData, className }) {
  const isPassed = layerData?.passed !== false;
  const confidence = layerData?.confidence !== undefined ? layerData.confidence : 1.0;
  const notes = layerData?.notes || "No forensic anomalies detected.";

  let statusBg = "bg-[#2F7D5A]/10 border-[#2F7D5A]/30 text-[#2F7D5A]";
  let Icon = CheckCircle2;
  
  if (!isPassed) {
    statusBg = "bg-[#B84A4A]/10 border-[#B84A4A]/30 text-[#B84A4A]";
    Icon = XCircle;
  } else if (confidence < 0.8) {
    statusBg = "bg-[#C58A32]/10 border-[#C58A32]/30 text-[#C58A32]";
    Icon = AlertTriangle;
  }

  return (
    <div className={cn("p-4 bg-white border border-[#71807A]/25 rounded-md shadow-sm space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#283733]">
          {layerKey} Layer
        </span>
        <div className="flex items-center space-x-1.5">
          <Icon className="h-4 w-4 shrink-0" />
          <span className="text-xs font-bold font-mono">
            {(confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="w-full bg-[#FCF5EE] h-1.5 rounded-full overflow-hidden border border-[#71807A]/15">
        <div
          className={cn("h-full transition-all duration-500 rounded-full", isPassed ? "bg-[#2F7D5A]" : "bg-[#B84A4A]")}
          style={{ width: `${Math.min(100, confidence * 100)}%` }}
        />
      </div>

      <p className="text-xs text-[#71807A] leading-relaxed pt-1">{notes}</p>
    </div>
  );
}
