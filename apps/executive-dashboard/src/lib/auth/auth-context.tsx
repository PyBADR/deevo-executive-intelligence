"use client";

/**
 * Light Auth Context — Organization + Role-based access structure.
 *
 * Architecture Decision:
 *   This is a structural placeholder for the SaaS auth layer.
 *   No actual authentication is performed — the context provides
 *   org_id, API key, and role from session/config, allowing
 *   downstream components to check permissions.
 *
 * SaaS Implementation Path:
 *   1. Replace session mock with JWT/OAuth provider
 *   2. Validate API key against backend /auth/validate
 *   3. Fetch org permissions from /orgs/{org_id}/permissions
 *   4. Gate routes with middleware based on role
 *
 * Data Flow:
 *   SessionStorage/Config → AuthProvider → useAuth() → Components
 */

import { createContext, useContext, useMemo } from "react";
import type { UserPermission } from "@/config/saas";
import { ROLE_PERMISSIONS } from "@/config/saas";

// ─── Types ───────────────────────────────────────────────────────

export interface AuthSession {
  orgId: string;
  orgName: string;
  userId: string;
  email: string;
  role: "admin" | "analyst" | "viewer";
  apiKey: string;
  tierId: string;
  permissions: UserPermission[];
}

interface AuthContextValue {
  session: AuthSession;
  hasPermission: (permission: UserPermission) => boolean;
  isAdmin: boolean;
  isAuthenticated: boolean; // always true for now — placeholder
}

// ─── Default Session (demo mode) ─────────────────────────────────

const DEMO_SESSION: AuthSession = {
  orgId: "org_demo_001",
  orgName: "Deevo Analytics (Demo)",
  userId: "user_demo_001",
  email: "demo@deevo.ai",
  role: "admin",
  apiKey: "dv_demo_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  tierId: "enterprise",
  permissions: ROLE_PERMISSIONS.admin,
};

// ─── Context ─────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  session: overrideSession,
}: {
  children: React.ReactNode;
  session?: Partial<AuthSession>;
}) {
  const session = useMemo<AuthSession>(() => {
    if (!overrideSession) return DEMO_SESSION;
    return {
      ...DEMO_SESSION,
      ...overrideSession,
      permissions:
        overrideSession.role
          ? ROLE_PERMISSIONS[overrideSession.role] || ROLE_PERMISSIONS.viewer
          : DEMO_SESSION.permissions,
    };
  }, [overrideSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      hasPermission: (permission: UserPermission) =>
        session.permissions.includes(permission),
      isAdmin: session.role === "admin",
      isAuthenticated: true, // Placeholder — always true until real auth
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

// ─── Permission Guard Component ──────────────────────────────────

export function RequirePermission({
  permission,
  children,
  fallback,
}: {
  permission: UserPermission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) {
    return fallback ? <>{fallback}</> : null;
  }
  return <>{children}</>;
}
