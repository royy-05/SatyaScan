import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0FA891] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]",
  {
    variants: {
      variant: {
        default: "bg-[#0FA891] text-white hover:bg-[#0D8F7B] shadow-xs font-bold",
        primary: "bg-[#0FA891] text-white hover:bg-[#0D8F7B] shadow-xs font-bold",
        gold: "bg-[#0FA891] text-white hover:bg-[#0D8F7B] font-bold shadow-xs",
        destructive: "bg-rose-600 text-white hover:bg-rose-700 font-bold shadow-xs",
        outline: "border border-slate-200 bg-white text-[#0F172A] hover:bg-slate-50 hover:border-slate-300 font-semibold",
        secondary: "bg-slate-100 text-[#0F172A] border border-slate-200 hover:bg-slate-200 font-semibold",
        ghost: "text-[#0F172A] hover:bg-slate-100 hover:text-[#0F172A] font-semibold",
        link: "text-[#0FA891] underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
