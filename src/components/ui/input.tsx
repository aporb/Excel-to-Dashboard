import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg",
          "border border-border bg-background/50 backdrop-blur-sm",
          "px-4 py-2 text-base",
          "shadow-sm transition-all duration-200",
          "text-foreground placeholder:text-foreground-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "focus-visible:border-primary focus-visible:bg-background/80",
          "hover:border-border-strong hover:bg-background/70",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background/50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
