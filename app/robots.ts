import type { MetadataRoute } from "next";
import { SHOP_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${SHOP_URL}/sitemap.xml`,
  };
}
