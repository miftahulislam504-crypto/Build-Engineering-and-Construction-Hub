"use client";

// components/providers/PwaProvider.tsx
//
// Registers the service worker (public/sw.js) on mount. Silently no-ops
// on browsers without service worker support instead of throwing, and
// only runs in production builds — during local dev, a cached service
// worker fighting with Next.js's fast-refresh dev server causes far
// more confusion than it's worth.

import { useEffect } from "react";

export default function PwaProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // If an updated service worker is found, activate it immediately
        // on next load rather than leaving customers on a stale version.
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener("statechange", () => {
            if (newWorker.state === "activated") {
              // eslint-disable-next-line no-console
              console.log("[PWA] Updated service worker activated.");
            }
          });
        });
      } catch (err) {
        // Non-fatal — the site works fine without a service worker,
        // it just won't have offline support or an install prompt.
        // eslint-disable-next-line no-console
        console.warn("[PWA] Service worker registration failed:", err);
      }
    };

    register();
  }, []);

  return null;
}
