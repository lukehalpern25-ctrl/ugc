"use client";

import { useCallback, useEffect, useRef } from "react";

function getVisitorId(): string {
  const key = "gymdex-visitor-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function useAnalytics() {
  const visitorIdRef = useRef<string | null>(null);

  useEffect(() => {
    visitorIdRef.current = getVisitorId();
  }, []);

  const track = useCallback(
    (eventType: string, eventData?: Record<string, unknown>) => {
      const creatorId = localStorage.getItem("gymdex-creator-id") || undefined;

      // Fire and forget — don't block UI
      fetch("/api/gymdex/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: eventType,
          event_data: eventData || {},
          visitor_id: visitorIdRef.current,
          creator_id: creatorId,
          page: window.location.pathname,
        }),
      }).catch(() => {
        // Silent fail — analytics should never break the app
      });
    },
    []
  );

  const trackPageView = useCallback(
    (page: string) => {
      track("page_view", { page });
    },
    [track]
  );

  return { track, trackPageView };
}
