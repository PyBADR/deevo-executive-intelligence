"use client";

/**
 * ToastContainer — Renders floating notification toasts.
 *
 * Position: Fixed bottom-right corner.
 * Behavior: Auto-dismiss after 8s (critical stays longer), manual dismiss.
 * Severity: Color-coded with glow matching alert system.
 */

import { useState, useEffect, useCallback } from "react";
import { getNotificationEngine, ToastNotification } from "@/lib/notifications/notification-engine";

const SEVERITY_STYLE: Record<string, { bg: string; border: string; color: string }> = {
  critical: { bg: "bg-red-500/8",    border: "border-red-500/30",  color: "text-red-400" },
  high:     { bg: "bg-orange-500/8", border: "border-orange-500/20", color: "text-orange-400" },
  medium:   { bg: "bg-yellow-500/8", border: "border-yellow-500/15", color: "text-yellow-400" },
  low:      { bg: "bg-emerald-500/8", border: "border-emerald-500/15", color: "text-emerald-400" },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const engine = getNotificationEngine();

  useEffect(() => {
    const unsubscribe = engine.onToast((allToasts) => {
      setToasts(allToasts.filter((t) => !t.dismissed));
    });
    return unsubscribe;
  }, [engine]);

  // Auto-dismiss after timeout
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const toast of toasts) {
      const timeout = toast.severity === "critical" ? 15000 : 8000;
      const t = setTimeout(() => {
        engine.dismissToast(toast.id);
      }, timeout);
      timers.push(t);
    }
    return () => timers.forEach(clearTimeout);
  }, [toasts, engine]);

  const dismiss = useCallback(
    (id: string) => engine.dismissToast(id),
    [engine]
  );

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.slice(0, 5).map((toast, idx) => {
        const style = SEVERITY_STYLE[toast.severity] || SEVERITY_STYLE.medium;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto ${style.bg} ${style.border} border rounded-xl p-4 backdrop-blur-xl shadow-card fade-in-up`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-label ${style.color}`}>{toast.severity}</span>
                </div>
                <div className="text-[12px] font-medium text-deevo-text-primary leading-snug mb-0.5">
                  {toast.title}
                </div>
                <div className="text-[11px] text-deevo-text-secondary leading-relaxed line-clamp-2">
                  {toast.message}
                </div>
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="text-deevo-text-muted hover:text-deevo-text-secondary transition-colors text-sm flex-shrink-0"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}

      {toasts.length > 5 && (
        <div className="pointer-events-auto text-center">
          <button
            onClick={() => engine.dismissAll()}
            className="text-[10px] text-deevo-text-muted hover:text-deevo-text-secondary"
          >
            +{toasts.length - 5} more — dismiss all
          </button>
        </div>
      )}
    </div>
  );
}
