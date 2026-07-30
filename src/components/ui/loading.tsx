import * as React from "react"
import { cn } from "@/lib/utils"

export function LoadingSpinner({ className, size = "md" }: { className?: string, size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4"
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-primary border-r-primary border-b-primary/20 border-l-primary/20",
        sizeClasses[size],
        className
      )}
    />
  )
}

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/50", className)}
      {...props}
    />
  )
}
