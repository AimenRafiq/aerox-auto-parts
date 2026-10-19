import type { MetadataRoute } from "next";
import { getAbsoluteSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/cart", "/checkout", "/order-confirmation/"],
    },
    sitemap: getAbsoluteSiteUrl("/sitemap.xml"),
  };
}
