import type { MetadataRoute } from "next";

const BASE_URL = "https://gotgoine.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/login", "/api"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
