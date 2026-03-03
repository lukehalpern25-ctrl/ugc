"use client";

import { useState, useEffect, useCallback } from "react";
import type { DashboardData } from "@/lib/gymdex/types";

export function useCreator() {
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load creator ID from localStorage or recovery param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recoverId = params.get("recover");

    if (recoverId) {
      localStorage.setItem("gymdex-creator-id", recoverId);
      // Strip recover param from URL
      const url = new URL(window.location.href);
      url.searchParams.delete("recover");
      window.history.replaceState({}, "", url.pathname);
      setCreatorId(recoverId);
    } else {
      const id = localStorage.getItem("gymdex-creator-id");
      setCreatorId(id);
    }
  }, []);

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    if (!creatorId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/gymdex/creator/${creatorId}`);
      if (!res.ok) {
        if (res.status === 404) {
          // Invalid ID, clear it
          localStorage.removeItem("gymdex-creator-id");
          setCreatorId(null);
          setError("Session expired. Please sign up again.");
        } else {
          throw new Error("Failed to load data");
        }
        return;
      }

      const dashboardData: DashboardData = await res.json();
      setData(dashboardData);
      setError(null);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    creatorId,
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
