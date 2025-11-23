"use client"

import * as React from "react"
import { Settings, Moon, Sun, Palette, Bell, Volume2 } from "lucide-react"
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
import { notificationManager, NotificationManager } from "@/lib/notification-manager"
import { STORAGE_KEYS } from "@/lib/storage-keys"

export function SettingsDialog() {
  const [apiKey, setApiKey] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false)
  const [notificationSound, setNotificationSound] = React.useState(true)
  const [notificationPermission, setNotificationPermission] = React.useState<NotificationPermission>("default")

  React.useEffect(() => {
    setMounted(true)
    // Load API key from localStorage on mount
    const savedKey = localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY)
    if (savedKey) {
      setApiKey(savedKey)
    }

    // Load notification preferences
    if (NotificationManager.isSupported()) {
      const prefs = notificationManager.getPreferences()
      setNotificationsEnabled(prefs.enabled)
      setNotificationSound(prefs.sound)
      setNotificationPermission(notificationManager.getPermissionStatus())
    }
  }, [])

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, apiKey.trim())
      toast.success("API key saved successfully!")
      setOpen(false)
    } else {
      localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY)
      toast.info("API key removed")
      setOpen(false)
    }
  }

  const handleClear = () => {
    setApiKey("")
    localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY)
    toast.info("API key cleared")
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    toast.success(`Theme changed to ${newTheme}`)
  }

  const handleNotificationToggle = async () => {
    if (!NotificationManager.isSupported()) {
      toast.error("Notifications not supported in your browser")
      return
    }

    if (!notificationsEnabled) {
      // Enable notifications - request permission
      const granted = await notificationManager.requestPermission()
      if (granted) {
        notificationManager.enable()
        setNotificationsEnabled(true)
        setNotificationPermission("granted")
        toast.success("Notifications enabled!")
      } else {
        toast.error("Notification permission denied")
      }
    } else {
      // Disable notifications
      notificationManager.disable()
      setNotificationsEnabled(false)
      toast.info("Notifications disabled")
    }
  }

  const handleNotificationSoundToggle = () => {
    const newValue = !notificationSound
    setNotificationSound(newValue)
    notificationManager.setPreferences({ sound: newValue })
    toast.success(`Notification sound ${newValue ? "enabled" : "disabled"}`)
  }

  if (!mounted) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center rounded-lg border border-border bg-background/50 backdrop-blur-sm h-10 w-10 shadow-sm transition-all duration-200 hover:bg-accent/50 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label="Settings">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your preferences and API keys
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api">API Configuration</TabsTrigger>
            <TabsTrigger value="theme">Theme & Display</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* API Configuration Tab */}
          <TabsContent value="api" className="space-y-4">
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="apiKey">Google Gemini API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="AI..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Google AI Studio
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

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-4 py-4">
              {!NotificationManager.isSupported() ? (
                <div className="p-3 rounded-lg bg-muted text-sm">
                  <p className="text-muted-foreground">
                    Notifications are not supported in your browser. Please use a modern browser like Chrome, Firefox, or Edge.
                  </p>
                </div>
              ) : (
                <>
                  {/* Enable Notifications */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base font-semibold">Browser Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when alerts are triggered
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={notificationsEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={handleNotificationToggle}
                    >
                      {notificationsEnabled ? "Enabled" : "Enable"}
                    </Button>
                  </div>

                  {/* Notification Sound */}
                  {notificationsEnabled && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <Volume2 className="h-5 w-5 text-primary" />
                        <div>
                          <Label className="text-base font-semibold">Notification Sound</Label>
                          <p className="text-sm text-muted-foreground">
                            Play sound when alerts trigger
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={notificationSound ? "default" : "outline"}
                        size="sm"
                        onClick={handleNotificationSoundToggle}
                      >
                        {notificationSound ? "On" : "Off"}
                      </Button>
                    </div>
                  )}

                  {/* Permission Status */}
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm font-medium">Permission Status</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notificationPermission === "granted"
                        ? "✓ Notifications are enabled"
                        : notificationPermission === "denied"
                        ? "✗ Notifications are blocked by your browser"
                        : "○ Notifications permission not yet requested"}
                    </p>
                  </div>
                </>
              )}
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
