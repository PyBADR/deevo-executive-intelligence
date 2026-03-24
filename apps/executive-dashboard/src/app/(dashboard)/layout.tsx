"use client";

/**
 * Dashboard Layout — wraps all intelligence pages with:
 *   - AuthProvider (org/role context)
 *   - AppShell (Sidebar, Topbar, Footer, IntelligenceProvider)
 *   - ToastContainer (floating notifications)
 */

import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ToastContainer } from "@/components/notifications/ToastContainer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
      <ToastContainer />
    </AuthProvider>
  );
}
