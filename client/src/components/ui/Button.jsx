import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#475853] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]",
  {
    variants: {
      variant: {
        default: "bg-[#283733] text-[#FDF6F0] hover:bg-[#475853] shadow-sm font-semibold",
        primary: "bg-[#283733] text-[#FDF6F0] hover:bg-[#475853] shadow-sm font-semibold",
        gold: "bg-[#DBCEB1] text-[#283733] hover:bg-[#c9b897] font-bold shadow-sm",
        destructive: "bg-[#B84A4A] text-white hover:bg-[#a03d3d] font-bold shadow-sm",
        outline: "border border-[#71807A]/40 bg-white text-[#283733] hover:bg-[#FCF5EE] hover:border-[#475853]",
        secondary: "bg-[#FCF5EE] text-[#283733] border border-[#71807A]/30 hover:bg-[#DBCEB1]/30",
        ghost: "text-[#283733] hover:bg-[#71807A]/15",
        link: "text-[#475853] underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-6 text-base",
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
