import * as React from "react";
import { cn } from "@/lib/utils";
import { androidClasses } from "@/lib/android-optimizations";

const AndroidCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    elevated?: boolean;
    interactive?: boolean;
  }
>(({ className, elevated, interactive, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      androidClasses.card,
      "android-touch-target",
      {
        "shadow-lg hover:shadow-xl transition-shadow duration-200": elevated,
        "hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 cursor-pointer": interactive,
      },
      className
    )}
    {...props}
  />
));
AndroidCard.displayName = "AndroidCard";

const AndroidCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 pb-2", className)}
    {...props}
  />
));
AndroidCardHeader.displayName = "AndroidCardHeader";

const AndroidCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-base font-semibold leading-none tracking-tight bengali-font", className)}
    {...props}
  />
));
AndroidCardTitle.displayName = "AndroidCardTitle";

const AndroidCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground bengali-font", className)}
    {...props}
  />
));
AndroidCardDescription.displayName = "AndroidCardDescription";

const AndroidCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-2", className)} {...props} />
));
AndroidCardContent.displayName = "AndroidCardContent";

const AndroidCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 pt-2", className)}
    {...props}
  />
));
AndroidCardFooter.displayName = "AndroidCardFooter";

export {
  AndroidCard,
  AndroidCardHeader,
  AndroidCardFooter,
  AndroidCardTitle,
  AndroidCardDescription,
  AndroidCardContent,
};