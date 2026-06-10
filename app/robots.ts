// app/robots.ts
import { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://buildmartbd.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     "/",
        disallow:  [
          "/admin/",
          "/api/",
          "/dashboard/",
          "/auth/",
          "/checkout/",
          "/cart/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow:     "/",
        disallow:  ["/admin/", "/api/", "/auth/"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host:    APP_URL,
  };
}
