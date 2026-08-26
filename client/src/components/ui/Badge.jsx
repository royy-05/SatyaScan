import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#283733] text-[#FDF6F0]",
        secondary: "border-transparent bg-[#DBCEB1] text-[#283733] font-bold",
        outline: "text-[#283733] border-[#71807A]/40 bg-white",
        PASS: "bg-[#2F7D5A]/15 text-[#2F7D5A] border-[#2F7D5A]/40 font-bold",
        VERIFIED: "bg-[#2F7D5A]/15 text-[#2F7D5A] border-[#2F7D5A]/40 font-bold",
        REVIEW: "bg-[#C58A32]/15 text-[#C58A32] border-[#C58A32]/40 font-bold",
        PENDING: "bg-[#C58A32]/15 text-[#C58A32] border-[#C58A32]/40 font-bold",
        FAIL: "bg-[#B84A4A]/15 text-[#B84A4A] border-[#B84A4A]/40 font-bold",
        FAILED: "bg-[#B84A4A]/15 text-[#B84A4A] border-[#B84A4A]/40 font-bold",
        INFO: "bg-[#527A8C]/15 text-[#527A8C] border-[#527A8C]/40 font-bold",
        PROCESSING: "bg-[#64748B]/15 text-[#64748B] border-[#64748B]/40 font-bold",
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
