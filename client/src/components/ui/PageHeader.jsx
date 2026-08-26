import React from "react";
import { cn } from "../../lib/utils";

export function PageHeader({ title, description, badge, actions, className }) {
  return (
    <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#71807A]/20", className)}>
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#283733]">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-xs text-[#71807A]">{description}</p>}
      </div>
      {actions && <div className="flex items-center space-x-2 shrink-0">{actions}</div>}
    </div>
  );
}
