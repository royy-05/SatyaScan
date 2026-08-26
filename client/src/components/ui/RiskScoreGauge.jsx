import React from "react";
import { cn } from "../../lib/utils";

export function RiskScoreGauge({ score = 0, verdict = "PASS", className }) {
  // Clamp score between 0 and 100
  const normalizedScore = Math.min(100, Math.max(0, typeof score === "number" ? (score <= 1 ? score * 100 : score) : 0));
  
  let trackColor = "bg-[#2F7D5A]";
  let textColor = "text-[#2F7D5A]";
  let label = "LOW RISK / CLEAR";
  let displayVerdict = verdict;

  if (verdict === "FAIL" || normalizedScore >= 70) {
    trackColor = "bg-[#B84A4A]";
    textColor = "text-[#B84A4A]";
    label = "HIGH RISK / THREAT";
    displayVerdict = "FAIL";
  } else if (verdict === "REVIEW" || (normalizedScore >= 30 && normalizedScore < 70)) {
    trackColor = "bg-[#C58A32]";
    textColor = "text-[#C58A32]";
    label = "ELEVATED RISK / REVIEW";
    displayVerdict = "REVIEW";
  } else {
    displayVerdict = "PASS";
  }

  return (
    <div className={cn("p-4 bg-white border border-[#71807A]/30 rounded-md shadow-sm space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#71807A]">
          Composite Risk Assessment
        </span>
        <span className={cn("text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border", 
          displayVerdict === "FAIL" ? "bg-[#B84A4A]/10 text-[#B84A4A] border-[#B84A4A]/30" :
          displayVerdict === "REVIEW" ? "bg-[#C58A32]/10 text-[#C58A32] border-[#C58A32]/30" :
          "bg-[#2F7D5A]/10 text-[#2F7D5A] border-[#2F7D5A]/30"
        )}>
          {label}
        </span>
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <div className="flex items-baseline space-x-1">
          <span className={cn("text-3xl font-extrabold font-mono tracking-tight", textColor)}>
            {normalizedScore.toFixed(0)}
          </span>
          <span className="text-xs font-medium text-[#71807A]">/ 100</span>
        </div>
        <div className="text-xs font-semibold text-[#283733]">
          Verdict: <span className={textColor}>{displayVerdict}</span>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full bg-[#FCF5EE] h-2.5 rounded-full overflow-hidden border border-[#71807A]/20">
        <div
          className={cn("h-full transition-all duration-500 rounded-full", trackColor)}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-[#71807A] font-mono pt-0.5">
        <span>0 (PASS)</span>
        <span>30 (REVIEW)</span>
        <span>70+ (FAIL)</span>
      </div>
    </div>
  );
}
