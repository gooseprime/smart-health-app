"use client"

import { Heart, Activity, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Enhanced Logo Icon */}
      <div className="relative">
        {/* Background circle with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full blur-sm" />
        
        {/* Main icon container */}
        <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-full p-1.5 shadow-lg">
          <div className="bg-white rounded-full p-1">
            <Heart className={cn("text-primary", sizeClasses[size])} fill="currentColor" />
          </div>
        </div>
        
        {/* Activity indicator dots */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-bold text-primary leading-tight", textSizeClasses[size])}>
            Smart Health
          </span>
          <span className={cn("text-xs text-muted-foreground font-medium -mt-1", size === "sm" ? "text-xs" : "text-xs")}>
            Monitor
          </span>
        </div>
      )}
    </div>
  )
}

// Compact version for mobile
export function LogoCompact({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full blur-sm" />
        <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-full p-1 shadow-lg">
          <div className="bg-white rounded-full p-1">
            <Heart className="w-6 h-6 text-primary" fill="currentColor" />
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white animate-pulse" />
      </div>
      <span className="text-lg font-bold text-primary">Health</span>
    </div>
  )
}
