"use client";

/**
 * AppShell — Production layout wrapper with integrated data layer.
 *
 * Structure:
 * ┌──────────┬──────────────────────────────┐
 * │          │  Topbar (scenario context)    │
 * │ Sidebar  ├──────────────────────────────┤
 * │ (nav +   │  Content (scrollable)         │
 * │  status) │                               │
 * │          ├──────────────────────────────┤
 * │          │  Footer (identity)            │
 * └──────────┴──────────────────────────────┘
 *
 * Data: IntelligenceProvider wraps everything — children
 * consume via useIntelligence() hook, no prop drilling.
 */

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Footer } from "./Footer";
import { IntelligenceProvider } from "@/lib/context/IntelligenceContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <IntelligenceProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Topbar />
          <main className="flex-1 overflow-auto">{children}</main>
          <Footer />
        </div>
      </div>
    </IntelligenceProvider>
  );
}
