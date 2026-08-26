import React from "react";
import { cn } from "../../lib/utils";

export function StatCard({ title, value, description, icon: Icon, valueColor = "text-[#283733]", className }) {
  return (
    <div className={cn("p-5 bg-white border border-[#71807A]/25 rounded-md shadow-sm flex flex-col justify-between space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#71807A]">{title}</span>
        {Icon && <Icon className="h-4 w-4 text-[#475853] shrink-0" />}
      </div>
      <div>
        <div className={cn("text-2xl font-extrabold font-mono tracking-tight", valueColor)}>
          {value}
        </div>
        {description && <p className="text-xs text-[#71807A] mt-1">{description}</p>}
      </div>
    </div>
  );
}
