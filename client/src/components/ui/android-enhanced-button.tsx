import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { androidHapticFeedback } from "@/lib/android-optimizations";

const androidButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 android-touch-target transform-gpu",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-lg hover:shadow-xl",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95 shadow-lg",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-95",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95 shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-95",
        link: "text-primary underline-offset-4 hover:underline active:scale-95",
        success: "bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-lg",
        warning: "bg-orange-500 text-white hover:bg-orange-600 active:scale-95 shadow-lg",
      },
      size: {
        default: "h-12 px-4 py-2 min-w-12",
        sm: "h-10 rounded-lg px-3 min-w-10",
        lg: "h-14 rounded-2xl px-8 min-w-14",
        icon: "h-12 w-12 rounded-xl",
      },
      haptic: {
        light: "",
        medium: "",
        heavy: "",
        none: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      haptic: "light",
    },
  }
);

export interface AndroidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof androidButtonVariants> {
  asChild?: boolean;
}

const AndroidEnhancedButton = React.forwardRef<HTMLButtonElement, AndroidButtonProps>(
  ({ className, variant, size, haptic, asChild = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      // Provide haptic feedback on Android
      if (haptic && haptic !== 'none') {
        await androidHapticFeedback(haptic);
      }
      
      // Call the original onClick handler
      if (onClick) {
        onClick(event);
      }
    };

    return (
      <Comp
        className={cn(androidButtonVariants({ variant, size, haptic, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  }
);

AndroidEnhancedButton.displayName = "AndroidEnhancedButton";

export { AndroidEnhancedButton, androidButtonVariants };