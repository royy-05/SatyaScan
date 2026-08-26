import React from "react";
import { Badge } from "./Badge";
import { Shield, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "../../lib/utils";

export function AuditTimeline({ decisions = [], verifications = [], className }) {
  if (decisions.length === 0 && verifications.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-[#71807A] italic bg-[#FCF5EE] border border-[#71807A]/20 rounded-md">
        No review decisions or verification events logged yet.
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {decisions.map((rd) => (
        <div key={rd.id} className="p-3 bg-[#FCF5EE] border border-[#71807A]/25 rounded-md space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-[#475853]" />
              <span className="text-xs font-bold text-[#283733]">
                Officer {rd.reviewer?.name || "Reviewer"}
              </span>
            </div>
            <Badge variant={rd.decision === "APPROVE" ? "PASS" : "FAIL"}>
              {rd.decision}
            </Badge>
          </div>
          <p className="text-xs text-[#283733] bg-white p-2 rounded border border-[#71807A]/20 font-sans">
            "{rd.notes}"
          </p>
          <div className="flex items-center space-x-1 text-[10px] text-[#71807A] font-mono">
            <Clock className="h-3 w-3" />
            <span>{new Date(rd.createdAt).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
