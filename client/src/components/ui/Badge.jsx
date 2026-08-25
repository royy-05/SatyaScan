import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-800 text-slate-100 hover:bg-slate-700",
        secondary: "border-transparent bg-slate-700 text-slate-200",
        outline: "text-slate-300 border-slate-700",
        // Verdict colors
        PASS: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold",
        REVIEW: "border-amber-500/30 bg-amber-500/10 text-amber-400 font-bold",
        FAIL: "border-rose-500/30 bg-rose-500/10 text-rose-400 font-bold",
        // Status colors
        PENDING: "border-slate-500/30 bg-slate-500/10 text-slate-400 font-medium",
        PROCESSING: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-medium animate-pulse",
        VERIFIED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium",
        FAILED: "border-rose-500/30 bg-rose-500/10 text-rose-400 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
