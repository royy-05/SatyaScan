import React from "react";
import { cn } from "../../lib/utils";

export function PageHeader({ title, description, badge, actions, className }) {
  return (
    <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200", className)}>
      <div className="space-y-1">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-sm text-slate-600 leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="flex items-center space-x-2 shrink-0">{actions}</div>}
    </div>
  );
}
