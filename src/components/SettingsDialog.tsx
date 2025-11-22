"use client"

import * as React from "react"
import { Settings, Moon, Sun, Palette } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useTheme } from "next-themes"

export function SettingsDialog() {
  const [apiKey, setApiKey] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
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

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    toast.success(`Theme changed to ${newTheme}`)
  }

  if (!mounted) return null

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
            Configure your preferences and API keys
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="api">API Configuration</TabsTrigger>
            <TabsTrigger value="theme">Theme & Display</TabsTrigger>
          </TabsList>

          {/* API Configuration Tab */}
          <TabsContent value="api" className="space-y-4">
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="apiKey">OpenAI API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    OpenAI Platform
                  </a>
                  . Your key is stored locally and never sent to our servers.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Theme & Display Tab */}
          <TabsContent value="theme" className="space-y-4">
            <div className="space-y-4 py-4">
              <div className="grid gap-3">
                <Label>Color Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      theme === "light"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Sun className="h-5 w-5" />
                    <span className="text-xs font-medium">Light</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      theme === "dark"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Moon className="h-5 w-5" />
                    <span className="text-xs font-medium">Dark</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange("system")}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      theme === "system"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Palette className="h-5 w-5" />
                    <span className="text-xs font-medium">System</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Display Preferences</Label>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>✓ Responsive design for all screen sizes</p>
                  <p>✓ Smooth animations and transitions</p>
                  <p>✓ Dark mode support</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClear}>
            Clear API Key
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
