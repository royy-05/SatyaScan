import React from "react";
import { Badge } from "./Badge";
import { Shield, Clock } from "lucide-react";
import { cn } from "../../lib/utils";

export function AuditTimeline({ decisions = [], verifications = [], className }) {
  if (decisions.length === 0 && verifications.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-500 italic bg-slate-50 border border-slate-200 rounded-xl">
        No review decisions or verification events logged yet.
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {decisions.map((rd) => (
        <div key={rd.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-[#0FA891]" />
              <span className="text-xs font-bold text-[#0F172A]">
                Officer {rd.reviewer?.name || "Reviewer"}
              </span>
            </div>
            <Badge variant={rd.decision === "APPROVE" ? "PASS" : "FAIL"}>
              {rd.decision}
            </Badge>
          </div>
          <p className="text-xs text-[#0F172A] bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-sans leading-relaxed">
            "{rd.notes}"
          </p>
          <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-mono">
            <Clock className="h-3 w-3" />
            <span>{new Date(rd.createdAt).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AuditTimeline;
