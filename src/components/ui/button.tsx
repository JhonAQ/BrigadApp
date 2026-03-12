import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-slate-900 text-white hover:bg-slate-800": variant === "primary",
            "bg-slate-100 text-slate-900 hover:bg-slate-200":
              variant === "secondary",
            "bg-red-600 text-white hover:bg-red-700": variant === "danger",
            "hover:bg-slate-100 text-slate-700": variant === "ghost",

            "h-9 px-4 py-2 text-sm": size === "sm",
            "h-10 px-6 py-2": size === "md",
            "h-12 px-8 text-lg": size === "lg",
            "h-10 w-10 p-0 text-xl": size === "icon",
          },
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
