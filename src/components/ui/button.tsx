"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

interface Ripple {
  x: number
  y: number
  id: number
}

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover shadow-md hover:shadow-lg",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-border bg-background/50 backdrop-blur-sm hover:bg-accent/50 hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline",
        glass: [
          "glass-standard",
          "text-foreground",
          "shadow-md hover:shadow-xl",
          "border border-border",
        ].join(" "),
        "glass-gradient": [
          "relative overflow-hidden",
          "glass-standard",
          "text-foreground",
          "shadow-md hover:shadow-xl",
          "before:absolute before:inset-0",
          "before:bg-gradient-to-br before:from-primary/20 before:to-accent/20",
          "before:opacity-0 hover:before:opacity-100",
          "before:transition-opacity before:duration-300",
        ].join(" "),
        "destructive-glass": [
          "glass-standard",
          "text-destructive",
          "border border-destructive/30",
          "hover:bg-destructive/10",
          "hover:border-destructive/50",
        ].join(" "),
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 px-4 py-2 text-xs",
        lg: "h-12 px-8 py-3 text-base",
        xl: "h-14 px-10 py-4 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, onClick, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Ripple[]>([])
    const Comp = asChild ? Slot : "button"

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (asChild || disabled || loading) {
        onClick?.(e)
        return
      }

      const button = e.currentTarget
      const rect = button.getBoundingClientRect()
      const ripple: Ripple = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        id: Date.now()
      }

      setRipples((prev) => [...prev, ripple])
      onClick?.(e)

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
      }, 600)
    }

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          loading && !asChild && "relative text-transparent hover:text-transparent pointer-events-none"
        )}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {!asChild && ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute bg-white/30 dark:bg-white/20 rounded-full animate-ripple pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        ))}
        {!asChild && loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
