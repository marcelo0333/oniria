import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/app/", "/api/", "/s/", "/entrar", "/redefinir-senha", "/verificar-email"] }],
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
