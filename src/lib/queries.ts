import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/env";
import { normalizeText } from "@/lib/format";
import type { PropertyFilters } from "@/lib/filters";
import type {
  Category,
  Feature,
  PropertyDetail,
  PropertyImage,
  PropertyListItem,
  Purpose,
  SiteSettings,
} from "@/lib/types";

/**
 * Consultas do SITE PÚBLICO. Usam a chave anônima, portanto só
 * retornam o que as regras RLS permitem (imóveis publicados).
 */

export const LIST_SELECT = "*, category:categories(id, name, slug)";

export const DEFAULT_SETTINGS: SiteSettings = {
  company_name: "Toninho Imóveis",
  logo_url: null,
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  instagram: "",
  facebook: "",
  business_hours: "",
  about_text: "",
  creci: "",
};

function fail(context: string, error: { message: string }): never {
  console.error(`[supabase] ${context}:`, error.message);
  throw new Error(`Não foi possível carregar ${context}.`);
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured) return DEFAULT_SETTINGS;
  const { data, error } = await createPublicClient()
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    console.error("[supabase] configurações:", error.message);
    return DEFAULT_SETTINGS;
  }
  return { ...DEFAULT_SETTINGS, ...(data ?? {}) };
});

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await createPublicClient()
    .from("categories")
    .select("id, name, slug, sort_order")
    .order("sort_order")
    .order("name");
  if (error) fail("as categorias", error);
  return data;
});

export const getFeatures = cache(async (): Promise<Feature[]> => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await createPublicClient()
    .from("features")
    .select("id, name, sort_order")
    .order("sort_order")
    .order("name");
  if (error) fail("as características", error);
  return data;
});

/** Cidades e bairros que possuem imóveis publicados (para os filtros). */
export const getLocations = cache(async () => {
  if (!isSupabaseConfigured) return [] as { city: string; neighborhoods: string[] }[];
  const { data, error } = await createPublicClient()
    .from("properties")
    .select("city, neighborhood")
    .limit(5000);
  if (error) fail("as localizações", error);

  const map = new Map<string, Set<string>>();
  for (const row of data) {
    if (!row.city) continue;
    if (!map.has(row.city)) map.set(row.city, new Set());
    if (row.neighborhood) map.get(row.city)!.add(row.neighborhood);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
    .map(([city, set]) => ({
      city,
      neighborhoods: [...set].sort((a, b) => a.localeCompare(b, "pt-BR")),
    }));
});

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export async function searchProperties(filters: PropertyFilters) {
  const empty = { items: [] as PropertyListItem[], total: 0, page: 1, pageCount: 1 };
  if (!isSupabaseConfigured) return empty;

  const supabase = createPublicClient();
  let query = supabase.from("properties").select(LIST_SELECT, { count: "exact" });

  if (filters.purpose) query = query.eq("purpose", filters.purpose);
  if (filters.offer) query = query.eq("is_offer", true);
  if (filters.city) query = query.eq("city", filters.city);
  if (filters.neighborhood) query = query.eq("neighborhood", filters.neighborhood);

  if (filters.category) {
    const categories = await getCategories();
    const category = categories.find((c) => c.slug === filters.category);
    if (!category) return empty;
    query = query.eq("category_id", category.id);
  }

  if (filters.q) {
    for (const word of normalizeText(filters.q).split(/\s+/).filter(Boolean).slice(0, 6)) {
      query = query.ilike("search_text", `%${escapeLike(word)}%`);
    }
  }

  if (filters.bedrooms !== undefined) query = query.gte("bedrooms", filters.bedrooms);
  if (filters.bathrooms !== undefined) query = query.gte("bathrooms", filters.bathrooms);
  if (filters.parking !== undefined) query = query.gte("parking_spots", filters.parking);
  if (filters.minPrice !== undefined) query = query.gte("effective_price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("effective_price", filters.maxPrice);
  if (filters.minArea !== undefined) query = query.gte("total_area", filters.minArea);
  if (filters.maxArea !== undefined) query = query.lte("total_area", filters.maxArea);

  // Imóveis disponíveis aparecem antes dos vendidos/alugados.
  query = query.order("status", { ascending: true });
  switch (filters.sort) {
    case "menor-preco":
      query = query.order("effective_price", { ascending: true });
      break;
    case "maior-preco":
      query = query.order("effective_price", { ascending: false });
      break;
    case "maior-area":
      query = query.order("total_area", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (filters.page - 1) * filters.pageSize;
  const { data, error, count } = await query
    .order("code", { ascending: true })
    .range(from, from + filters.pageSize - 1);

  // Página além do fim (PostgREST retorna erro 416): trata como vazio.
  if (error && error.code !== "PGRST103") fail("os imóveis", error);

  const total = count ?? 0;
  return {
    items: (data ?? []) as PropertyListItem[],
    total,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}

async function listProperties(
  build: (q: ReturnType<typeof baseList>) => ReturnType<typeof baseList>,
  limit: number,
) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await build(baseList()).limit(limit);
  if (error) fail("os imóveis", error);
  return data as PropertyListItem[];
}

function baseList() {
  return createPublicClient()
    .from("properties")
    .select(LIST_SELECT)
    .not("status", "in", "(vendido,alugado,indisponivel)");
}

export const getFeaturedProperties = cache((limit = 8) =>
  listProperties((q) => q.eq("is_featured", true).order("updated_at", { ascending: false }), limit),
);

export const getOfferProperties = cache((limit = 8) =>
  listProperties((q) => q.eq("is_offer", true).order("updated_at", { ascending: false }), limit),
);

export const getLatestByPurpose = cache((purpose: Purpose, limit = 8) =>
  listProperties((q) => q.eq("purpose", purpose).order("created_at", { ascending: false }), limit),
);

export async function getSimilarProperties(property: PropertyListItem, limit = 4) {
  return listProperties(
    (q) =>
      q
        .eq("purpose", property.purpose)
        .eq("city", property.city)
        .neq("id", property.id)
        .order("created_at", { ascending: false }),
    limit,
  );
}

/** Quantidade de imóveis publicados por categoria. */
export const getCategoryCounts = cache(async () => {
  if (!isSupabaseConfigured) return new Map<string, number>();
  const { data, error } = await createPublicClient()
    .from("properties")
    .select("category_id")
    .not("status", "in", "(vendido,alugado,indisponivel)")
    .limit(5000);
  if (error) fail("as categorias", error);
  const counts = new Map<string, number>();
  for (const row of data) {
    if (row.category_id) counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  }
  return counts;
});

export const getPropertyByCode = cache(async (code: string): Promise<PropertyDetail | null> => {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await createPublicClient()
    .from("properties")
    .select(
      `${LIST_SELECT}, images:property_images(*), property_features(feature:features(id, name, sort_order))`,
    )
    .ilike("code", code)
    .maybeSingle();
  if (error) fail("o imóvel", error);
  if (!data) return null;
  return toDetail(data);
});

type RawDetail = PropertyListItem & {
  images: PropertyImage[] | null;
  property_features: { feature: Feature | null }[] | null;
};

export function toDetail(data: unknown): PropertyDetail {
  const raw = data as RawDetail;
  const { property_features, images, ...rest } = raw;
  return {
    ...rest,
    images: [...(images ?? [])].sort(
      (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.position - b.position,
    ),
    features: (property_features ?? [])
      .map((pf) => pf.feature)
      .filter((f): f is Feature => Boolean(f))
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
  };
}

export async function getSitemapProperties() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await createPublicClient()
    .from("properties")
    .select("code, neighborhood, bedrooms, updated_at, category:categories(name)")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) fail("o sitemap", error);
  return data as unknown as {
    code: string;
    neighborhood: string;
    bedrooms: number;
    updated_at: string;
    category: { name: string } | null;
  }[];
}
