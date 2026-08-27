import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#0FA891] text-white font-bold",
        secondary: "border-transparent bg-[#0FA891]/10 text-[#0FA891] font-bold border-[#0FA891]/20",
        outline: "text-[#0F172A] border-slate-300 bg-white font-semibold",
        PASS: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",
        VERIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",
        REVIEW: "bg-amber-50 text-amber-700 border-amber-200 font-bold",
        PENDING: "bg-amber-50 text-amber-700 border-amber-200 font-bold",
        FAIL: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
        FAILED: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
        INFO: "bg-sky-50 text-sky-700 border-sky-200 font-bold",
        PROCESSING: "bg-slate-100 text-slate-700 border-slate-200 font-bold",
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
