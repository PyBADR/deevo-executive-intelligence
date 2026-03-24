/**
 * Notification Engine — Alert → Toast / Email / Webhook dispatch.
 *
 * Architecture Decision:
 *   Decoupled notification layer that receives Alert objects and dispatches
 *   through configured channels. Toast is live, email/webhook are structural
 *   placeholders for the SaaS tier.
 *
 * Data Flow:
 *   AlertEngine.evaluate() → NotificationEngine.dispatch() → Channel handlers
 *
 * Channels:
 *   - toast:   In-app UI notification (implemented)
 *   - email:   Placeholder — logs to console (SaaS: SendGrid/SES)
 *   - webhook: Placeholder — logs to console (SaaS: configurable endpoint)
 */

import type { Alert } from "@/lib/alert-engine";

// ─── Types ───────────────────────────────────────────────────────

export type NotificationChannel = "toast" | "email" | "webhook";

export interface NotificationConfig {
  channels: NotificationChannel[];
  emailRecipients?: string[];
  webhookUrl?: string;
  // SaaS tier: org-level notification preferences
  orgId?: string;
  suppressBelow?: "critical" | "high" | "medium" | "low";
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "high" | "medium" | "low";
  timestamp: string;
  dismissed: boolean;
  alertId?: string;
}

// ─── Default Config ──────────────────────────────────────────────

const DEFAULT_CONFIG: NotificationConfig = {
  channels: ["toast"],
  suppressBelow: "medium",
};

// ─── Notification Engine ─────────────────────────────────────────

export class NotificationEngine {
  private config: NotificationConfig;
  private toastQueue: ToastNotification[] = [];
  private listeners: Set<(toasts: ToastNotification[]) => void> = new Set();

  constructor(config?: Partial<NotificationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Dispatch alerts through configured notification channels.
   */
  dispatch(alerts: Alert[]): void {
    const SEVERITY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const suppressRank = SEVERITY_RANK[this.config.suppressBelow || "low"] ?? 3;

    for (const alert of alerts) {
      const alertRank = SEVERITY_RANK[alert.severity] ?? 3;
      if (alertRank > suppressRank) continue;

      for (const channel of this.config.channels) {
        switch (channel) {
          case "toast":
            this.dispatchToast(alert);
            break;
          case "email":
            this.dispatchEmail(alert);
            break;
          case "webhook":
            this.dispatchWebhook(alert);
            break;
        }
      }
    }
  }

  // ── Toast Channel (implemented) ──────────────────────────────

  private dispatchToast(alert: Alert): void {
    const toast: ToastNotification = {
      id: `toast_${alert.id}_${Date.now()}`,
      title: alert.name,
      message: alert.message,
      severity: alert.severity,
      timestamp: new Date().toISOString(),
      dismissed: false,
      alertId: alert.id,
    };

    this.toastQueue = [toast, ...this.toastQueue].slice(0, 20); // max 20
    this.notifyListeners();
  }

  /**
   * Subscribe to toast updates.
   */
  onToast(listener: (toasts: ToastNotification[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    for (const listener of Array.from(this.listeners)) {
      listener([...this.toastQueue]);
    }
  }

  dismissToast(id: string): void {
    this.toastQueue = this.toastQueue.map((t) =>
      t.id === id ? { ...t, dismissed: true } : t
    );
    this.notifyListeners();
  }

  dismissAll(): void {
    this.toastQueue = this.toastQueue.map((t) => ({ ...t, dismissed: true }));
    this.notifyListeners();
  }

  getActiveToasts(): ToastNotification[] {
    return this.toastQueue.filter((t) => !t.dismissed);
  }

  // ── Email Channel (placeholder) ──────────────────────────────

  private dispatchEmail(alert: Alert): void {
    // SaaS tier implementation:
    // - SendGrid / Amazon SES integration
    // - Org-level email templates
    // - Digest mode (batch alerts into single email)
    console.log(
      `[NOTIFICATION:EMAIL] Would send email for alert: ${alert.name} (${alert.severity})`,
      {
        recipients: this.config.emailRecipients || ["admin@org.deevo.ai"],
        subject: `[${alert.severity.toUpperCase()}] ${alert.name}`,
        body: alert.message,
      }
    );
  }

  // ── Webhook Channel (placeholder) ────────────────────────────

  private dispatchWebhook(alert: Alert): void {
    // SaaS tier implementation:
    // - POST to org-configured webhook URL
    // - HMAC-SHA256 signature for verification
    // - Retry with exponential backoff
    // - Slack / Teams / PagerDuty integration templates
    console.log(
      `[NOTIFICATION:WEBHOOK] Would POST to webhook for alert: ${alert.name} (${alert.severity})`,
      {
        url: this.config.webhookUrl || "https://hooks.org.deevo.ai/alerts",
        payload: {
          event: "alert.triggered",
          alert_id: alert.id,
          name: alert.name,
          severity: alert.severity,
          message: alert.message,
          actual_value: alert.actualValue,
          threshold_value: alert.thresholdValue,
          scenario_id: alert.scenarioId,
          triggered_at: alert.triggeredAt,
        },
      }
    );
  }
}

// ─── Singleton Instance ──────────────────────────────────────────

let _instance: NotificationEngine | null = null;

export function getNotificationEngine(config?: Partial<NotificationConfig>): NotificationEngine {
  if (!_instance) {
    _instance = new NotificationEngine(config);
  }
  return _instance;
}
