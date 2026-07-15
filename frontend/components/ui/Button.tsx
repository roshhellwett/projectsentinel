import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-bold font-body ring-offset-paper rounded-lg transition-all transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0 active:translate-x-0 active:shadow-none",
  {
    variants: {
      variant: {
        default: "border-2 border-ink bg-ink text-paper shadow-[2px_2px_0px_rgb(var(--c-ink))] hover:shadow-[4px_4px_0px_rgb(var(--c-ink))] hover:bg-ink/90",
        destructive: "border-2 border-ink text-ink shadow-[2px_2px_0px_rgb(var(--c-ink))] hover:shadow-[4px_4px_0px_rgb(var(--c-ink))] hover:bg-ink hover:text-paper",
        outline:
          "border-2 border-ink bg-paper text-ink shadow-[2px_2px_0px_rgb(var(--c-ink))] hover:shadow-[4px_4px_0px_rgb(var(--c-ink))] hover:bg-paper-2",
        secondary: "border-2 border-ink text-ink shadow-[2px_2px_0px_rgb(var(--c-ink))] hover:shadow-[4px_4px_0px_rgb(var(--c-ink))]",
        ghost: "text-ink-soft hover:text-ink hover:bg-ink/5",
        link: "text-ink underline underline-offset-4",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
