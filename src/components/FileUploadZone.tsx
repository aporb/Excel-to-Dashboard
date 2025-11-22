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
        "relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
        isDragging && "border-primary bg-primary/5",
        !isDragging && "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50",
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
      
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          {isDragging ? (
            <FileSpreadsheet className="h-8 w-8 text-primary" />
          ) : (
            <Upload className="h-8 w-8 text-primary" />
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-lg font-semibold">
            {isDragging ? "Drop your file here" : "Upload your spreadsheet"}
          </p>
          <p className="text-sm text-muted-foreground">
            Drag and drop or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports CSV, Excel (.xlsx, .xls)
          </p>
        </div>
      </div>
    </div>
  )
}
