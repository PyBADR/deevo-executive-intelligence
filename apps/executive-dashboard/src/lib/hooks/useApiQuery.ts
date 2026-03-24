"use client";

/**
 * useApiQuery — Generic data fetching hook with caching, loading, and error states.
 *
 * Architecture Decision:
 *   Single reusable hook that all domain hooks build on.
 *   In-memory cache keyed by endpoint path.
 *   No external dependencies (no React Query, no SWR).
 *   Keeps the dependency tree minimal for sovereign deployment.
 *
 * Cache Strategy:
 *   Simple TTL-based in-memory map. Cache invalidated on:
 *   - TTL expiry (default 60s)
 *   - Manual refetch() call
 *   - Component remount with stale key
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Cache ──────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL = 60_000; // 60 seconds

// ─── Hook State ─────────────────────────────────────────────────

export interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  /** Timestamp of last successful fetch */
  lastUpdated: number | null;
}

// ─── Hook ───────────────────────────────────────────────────────

export function useApiQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    /** Cache TTL in ms. Default 60s. Set to 0 to disable cache. */
    ttl?: number;
    /** Skip fetching (e.g. when a dependency isn't ready) */
    enabled?: boolean;
  }
): QueryState<T> {
  const ttl = options?.ttl ?? DEFAULT_TTL;
  const enabled = options?.enabled ?? true;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Check cache
    if (ttl > 0) {
      const cached = cache.get(key) as CacheEntry<T> | undefined;
      if (cached && Date.now() - cached.timestamp < ttl) {
        setData(cached.data);
        setLastUpdated(cached.timestamp);
        setLoading(false);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      if (!mountedRef.current) return;

      const now = Date.now();
      setData(result);
      setLastUpdated(now);
      setLoading(false);

      // Update cache
      if (ttl > 0) {
        cache.set(key, { data: result, timestamp: now });
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError((err as Error).message);
      setLoading(false);
    }
  }, [key, fetcher, ttl, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    cache.delete(key);
    fetchData();
  }, [key, fetchData]);

  return { data, loading, error, refetch, lastUpdated };
}

// ─── Cache Utilities ────────────────────────────────────────────

/** Clear all cached data. Useful on scenario change. */
export function clearQueryCache(): void {
  cache.clear();
}

/** Invalidate a specific cache key. */
export function invalidateQuery(key: string): void {
  cache.delete(key);
}
