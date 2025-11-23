/**
 * Notification Manager
 * Handles browser notifications for alerts and events
 */

import { STORAGE_KEYS } from './storage-keys';

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  requireInteraction: boolean;
}

const DEFAULT_ICON = '/next.svg';

/**
 * Notification Manager Class
 */
export class NotificationManager {
  private static instance: NotificationManager;
  private preferences: NotificationPreferences;
  private permissionStatus: NotificationPermission = 'default';

  private constructor() {
    this.preferences = this.loadPreferences();
    this.updatePermissionStatus();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * Check if notifications are supported
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!NotificationManager.isSupported()) {
      console.warn('Notifications not supported in this browser');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionStatus = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  /**
   * Send a notification
   */
  async notify(options: NotificationOptions): Promise<Notification | null> {
    if (!this.isEnabled()) {
      return null;
    }

    if (!NotificationManager.isSupported()) {
      console.warn('Notifications not supported in this browser');
      return null;
    }

    // Request permission if needed
    if (this.permissionStatus === 'default') {
      const granted = await this.requestPermission();
      if (!granted) {
        return null;
      }
    }

    if (this.permissionStatus !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || DEFAULT_ICON,
        badge: options.badge,
        tag: options.tag,
        requireInteraction: options.requireInteraction ?? this.preferences.requireInteraction,
      });

      // Play sound if enabled
      if (this.preferences.sound) {
        this.playNotificationSound();
      }

      return notification;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return null;
    }
  }

  /**
   * Send alert notification
   */
  async notifyAlert(
    alertName: string,
    message: string,
    severity: 'info' | 'warning' | 'error' = 'warning'
  ): Promise<Notification | null> {
    const icons = {
      info: '📋',
      warning: '⚠️',
      error: '🚨',
    };

    return this.notify({
      title: `${icons[severity]} Alert: ${alertName}`,
      body: message,
      tag: `alert-${alertName}`,
      requireInteraction: severity !== 'info',
    });
  }

  /**
   * Send success notification
   */
  async notifySuccess(title: string, message?: string): Promise<Notification | null> {
    return this.notify({
      title: `✅ ${title}`,
      body: message,
      tag: 'success',
    });
  }

  /**
   * Send error notification
   */
  async notifyError(title: string, message?: string): Promise<Notification | null> {
    return this.notify({
      title: `❌ ${title}`,
      body: message,
      tag: 'error',
      requireInteraction: true,
    });
  }

  /**
   * Send info notification
   */
  async notifyInfo(title: string, message?: string): Promise<Notification | null> {
    return this.notify({
      title: `ℹ️ ${title}`,
      body: message,
      tag: 'info',
    });
  }

  /**
   * Get current preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Update preferences
   */
  setPreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = {
      ...this.preferences,
      ...preferences,
    };
    this.savePreferences();
  }

  /**
   * Enable notifications
   */
  enable(): void {
    this.setPreferences({ enabled: true });
  }

  /**
   * Disable notifications
   */
  disable(): void {
    this.setPreferences({ enabled: false });
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.preferences.enabled && this.permissionStatus === 'granted';
  }

  /**
   * Get permission status
   */
  getPermissionStatus(): NotificationPermission {
    return this.permissionStatus;
  }

  /**
   * Close all notifications with a specific tag
   */
  closeByTag(tag: string): void {
    if (!NotificationManager.isSupported()) {
      return;
    }

    // Note: There's no direct API to close notifications by tag,
    // but we can track them manually if needed
    console.log(`Closing notifications with tag: ${tag}`);
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): NotificationPreferences {
    if (typeof window === 'undefined') {
      return {
        enabled: false,
        sound: true,
        requireInteraction: false,
      };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }

    return {
      enabled: false,
      sound: true,
      requireInteraction: false,
    };
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES, JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }

  /**
   * Update permission status
   */
  private updatePermissionStatus(): void {
    if (!NotificationManager.isSupported()) {
      return;
    }

    this.permissionStatus = Notification.permission;
  }

  /**
   * Play notification sound
   */
  private playNotificationSound(): void {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // 800 Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }
}

/**
 * Export singleton instance
 */
export const notificationManager = NotificationManager.getInstance();

/**
 * Hook-like function for React components
 */
export function useNotifications() {
  return {
    notify: (options: NotificationOptions) => notificationManager.notify(options),
    notifyAlert: (name: string, message: string, severity?: 'info' | 'warning' | 'error') =>
      notificationManager.notifyAlert(name, message, severity),
    notifySuccess: (title: string, message?: string) => notificationManager.notifySuccess(title, message),
    notifyError: (title: string, message?: string) => notificationManager.notifyError(title, message),
    notifyInfo: (title: string, message?: string) => notificationManager.notifyInfo(title, message),
    requestPermission: () => notificationManager.requestPermission(),
    getPreferences: () => notificationManager.getPreferences(),
    setPreferences: (prefs: Partial<NotificationPreferences>) => notificationManager.setPreferences(prefs),
    isEnabled: () => notificationManager.isEnabled(),
    getPermissionStatus: () => notificationManager.getPermissionStatus(),
  };
}
