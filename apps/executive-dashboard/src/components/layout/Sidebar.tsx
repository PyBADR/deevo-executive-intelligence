"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { NAVIGATION } from "@/config/navigation";
import { BRANDING } from "@/config/branding";
import { useIntelligence } from "@/lib/context/IntelligenceContext";

export function Sidebar() {
  const pathname = usePathname();
  const { scenarios, scenariosLoading, ingestionStatus } = useIntelligence();

  return (
    <nav className="w-64 border-r border-deevo-border bg-deevo-surface flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-deevo-border">
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-deevo-gold">{BRANDING.product.shortName}</span>
          <span className="text-deevo-text-muted ml-1.5 text-sm font-normal">
            Intelligence
          </span>
        </h1>
        <div className="text-[10px] text-deevo-text-muted mt-1.5 tracking-wider uppercase">
          {BRANDING.product.company}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-5 space-y-0.5 px-3 overflow-y-auto">
        {NAVIGATION.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? "bg-deevo-elevated text-deevo-text-primary border border-deevo-border"
                  : "text-deevo-text-secondary hover:text-deevo-text-primary hover:bg-deevo-elevated border border-transparent"
              }`}
            >
              <span
                className={`text-xs w-4 text-center ${
                  isActive ? "text-deevo-gold" : "text-deevo-gold/40"
                }`}
              >
                {item.icon}
              </span>
              <span className={isActive ? "font-medium" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Live Status */}
      <div className="p-5 border-t border-deevo-border">
        <div className="text-[11px] text-deevo-text-muted space-y-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              ingestionStatus?.status === "running"
                ? "bg-deevo-gold animate-pulse"
                : scenarios.length > 0
                ? "bg-emerald-500"
                : "bg-deevo-text-muted"
            }`} />
            <span className="font-medium text-deevo-text-secondary">
              {scenariosLoading
                ? "Connecting..."
                : `${scenarios.length} live scenario${scenarios.length !== 1 ? "s" : ""}`
              }
            </span>
          </div>
          <div className="text-[10px] pl-4">
            {BRANDING.pipeline.stages} stages · {BRANDING.pipeline.sectors} sectors · {BRANDING.pipeline.countries} countries
          </div>
        </div>
      </div>
    </nav>
  );
}
