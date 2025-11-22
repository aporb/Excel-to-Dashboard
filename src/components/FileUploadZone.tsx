"use client"

import * as React from "react"
import { Upload, FileSpreadsheet } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void
  accept?: string
  disabled?: boolean
}

export function FileUploadZone({ onFileSelect, accept = ".csv,.xlsx,.xls", disabled = false }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const file = e.dataTransfer.files[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        /* Base Glass Styling */
        "relative overflow-hidden",
        "glass-standard rounded-xl p-12",
        "text-center cursor-pointer",
        "transition-all duration-300 ease-out",

        /* Drag State */
        isDragging && [
          "scale-[1.02]",
          "border-primary/50",
        ],

        /* Hover State */
        !isDragging && "hover:scale-[1.01]",

        /* Disabled State */
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Animated Background Gradient */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500",
          "bg-gradient-to-br from-primary/10 via-transparent to-accent/10",
          isDragging && "opacity-100"
        )}
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated Icon Container */}
        <div
          className={cn(
            "relative h-20 w-20 rounded-full",
            "glass-subtle",
            "flex items-center justify-center",
            "transition-all duration-300",
            isDragging && "scale-110"
          )}
        >
          {/* Icon Glow Effect */}
          <div
            className={cn(
              "absolute inset-0 rounded-full blur-xl opacity-0 transition-opacity duration-300",
              "bg-gradient-to-br from-primary/40 to-accent/40",
              isDragging && "opacity-100 animate-pulse-subtle"
            )}
          />

          {isDragging ? (
            <FileSpreadsheet className="relative h-10 w-10 text-primary transition-transform duration-300" />
          ) : (
            <Upload className="relative h-10 w-10 text-primary transition-transform duration-300" />
          )}
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <p className="text-xl font-semibold text-foreground">
            {isDragging ? "Drop your file here" : "Upload your spreadsheet"}
          </p>
          <p className="text-sm text-foreground-muted">
            Drag and drop or click to browse
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-foreground-subtle">
            <div className="h-1 w-1 rounded-full bg-foreground-subtle" />
            <span>Supports CSV, Excel (.xlsx, .xls)</span>
            <div className="h-1 w-1 rounded-full bg-foreground-subtle" />
            <span>Max 10MB</span>
          </div>
        </div>
      </div>
    </div>
  )
}
