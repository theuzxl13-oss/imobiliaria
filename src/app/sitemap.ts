import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { getSitemapProperties } from "@/lib/queries";
import { propertyPath } from "@/lib/format";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["", "/comprar", "/alugar", "/imoveis", "/ofertas", "/sobre", "/contato", "/anuncie"];
  const properties = await getSitemapProperties().catch(() => []);

  return [
    ...staticPages.map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: "daily" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...properties.map((p) => ({
      url: `${SITE_URL}${propertyPath(p)}`,
      lastModified: p.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
