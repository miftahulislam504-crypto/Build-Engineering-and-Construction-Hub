"use client";

import { useEffect } from "react";

// ─────────────────────────────────────────
// Tawk.to Live Chat Integration
//
// Setup:
// 1. tawk.to তে account খোলো (free)
// 2. Settings → Chat Widget → Property ID এবং Widget ID নাও
// 3. .env.local এ add করো:
//    NEXT_PUBLIC_TAWKTO_PROPERTY_ID=your_property_id
//    NEXT_PUBLIC_TAWKTO_WIDGET_ID=your_widget_id
// ─────────────────────────────────────────

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget:  () => void;
      showWidget:  () => void;
      minimize:    () => void;
      maximize:    () => void;
      toggle:      () => void;
      setAttributes:(attrs: Record<string, string>, cb?: () => void) => void;
    };
    Tawk_LoadStart?: Date;
  }
}

export default function LiveChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID;
  const widgetId   = process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID || "default";

  useEffect(() => {
    // Only load if property ID is set
    if (!propertyId) return;

    // Avoid loading twice
    if (document.getElementById("tawkto-script")) return;

    window.Tawk_API = window.Tawk_API || ({} as Window["Tawk_API"]);
    window.Tawk_LoadStart = new Date();

    const script    = document.createElement("script");
    script.id       = "tawkto-script";
    script.async    = true;
    script.src      = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset  = "UTF-8";
    script.setAttribute("crossorigin", "*");

    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const s = document.getElementById("tawkto-script");
      if (s) s.remove();
    };
  }, [propertyId, widgetId]);

  // No visible UI — Tawk.to injects its own widget
  return null;
}
