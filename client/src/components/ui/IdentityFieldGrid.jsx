import React from "react";
import { cn } from "../../lib/utils";

export function IdentityFieldGrid({ extracted = {}, className }) {
  const fields = [
    { label: "Full Name", value: extracted.name || extracted.extractedName, key: "name" },
    { label: "Document Number", value: extracted.docNumber || extracted.extractedDocNumber, key: "docNumber", isMono: true, isHighlight: true },
    { label: "Nationality", value: extracted.nationality || extracted.extractedNationality || "IND", key: "nationality" },
    { label: "Date of Birth", value: extracted.dob || extracted.extractedDob, key: "dob", isMono: true },
    { label: "Expiration Date", value: extracted.expiry || extracted.extractedExpiry, key: "expiry", isMono: true },
    { label: "Gender", value: extracted.gender || extracted.extractedGender, key: "gender" },
  ];

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", className)}>
      {fields.map((field) => (
        <div key={field.key} className="p-3 bg-[#FCF5EE] border border-[#71807A]/25 rounded-md space-y-1">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#71807A]">{field.label}</p>
          <p className={cn("text-sm font-semibold text-[#283733]", 
            field.isMono && "font-mono tracking-tight",
            field.isHighlight && "text-[#475853] font-bold"
          )}>
            {field.value || "N/A"}
          </p>
        </div>
      ))}
    </div>
  );
}
