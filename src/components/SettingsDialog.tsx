"use client"

import * as React from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function SettingsDialog() {
  const [apiKey, setApiKey] = React.useState("")
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    // Load API key from localStorage on mount
    const savedKey = localStorage.getItem("openai_api_key")
    if (savedKey) {
      setApiKey(savedKey)
    }
  }, [])

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("openai_api_key", apiKey.trim())
      toast.success("API key saved successfully!")
      setOpen(false)
    } else {
      localStorage.removeItem("openai_api_key")
      toast.info("API key removed")
      setOpen(false)
    }
  }

  const handleClear = () => {
    setApiKey("")
    localStorage.removeItem("openai_api_key")
    toast.info("API key cleared")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your OpenAI API key for AI-powered chart suggestions.
            Get your API key from{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              OpenAI Platform
            </a>
            .
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
            />
            <p className="text-sm text-muted-foreground">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
