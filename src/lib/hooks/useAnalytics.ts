"use client";

import { useCallback } from "react";

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  const key = "gymdex-visitor-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function useAnalytics() {
  const track = useCallback(
    (eventType: string, eventData?: Record<string, unknown>) => {
      const visitorId = getVisitorId();
      const creatorId = localStorage.getItem("gymdex-creator-id") || undefined;

      fetch("/api/gymdex/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: eventType,
          event_data: eventData || {},
          visitor_id: visitorId,
          creator_id: creatorId,
          page: window.location.pathname,
        }),
      }).catch((err) => {
        if (process.env.NODE_ENV === "development") {
          console.error("[Analytics] Failed to track event:", eventType, err);
        }
      });
    },
    []
  );

  const trackPageView = useCallback(
    (pagePath: string) => {
      track("page_viewed", { path: pagePath });
    },
    [track]
  );

  return { track, trackPageView };
}
