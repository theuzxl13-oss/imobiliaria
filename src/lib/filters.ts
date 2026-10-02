import { PAGE_SIZE, SORT_OPTIONS, type SortOption } from "./constants";
import type { Purpose } from "./types";

export interface PropertyFilters {
  purpose?: Purpose;
  q?: string;
  city?: string;
  neighborhood?: string;
  category?: string;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  offer?: boolean;
  sort: SortOption;
  page: number;
  pageSize: number;
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

function str(value: string | string[] | undefined) {
  const v = Array.isArray(value) ? value[0] : value;
  const trimmed = v?.trim();
  return trimmed ? trimmed.slice(0, 100) : undefined;
}

function num(value: string | string[] | undefined) {
  const v = str(value);
  if (!v) return undefined;
  const n = Number(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Converte os parâmetros da URL em filtros validados. */
export function parseFilters(
  params: RawSearchParams,
  forced: Partial<PropertyFilters> = {},
): PropertyFilters {
  const purpose = str(params.finalidade);
  const sort = str(params.ordem) as SortOption | undefined;
  const page = Math.max(1, Math.floor(num(params.pagina) ?? 1));

  return {
    purpose: purpose === "venda" || purpose === "aluguel" ? purpose : undefined,
    q: str(params.q),
    city: str(params.cidade),
    neighborhood: str(params.bairro),
    category: str(params.tipo),
    bedrooms: num(params.quartos),
    bathrooms: num(params.banheiros),
    parking: num(params.vagas),
    minPrice: num(params.preco_min),
    maxPrice: num(params.preco_max),
    minArea: num(params.area_min),
    maxArea: num(params.area_max),
    offer: str(params.oferta) === "1" ? true : undefined,
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort! : "recentes",
    page,
    pageSize: PAGE_SIZE,
    ...forced,
  };
}

/** Conta quantos filtros avançados estão ativos (para o botão "Filtros"). */
export function countActiveFilters(f: PropertyFilters) {
  return [
    f.q, f.city, f.neighborhood, f.category, f.bedrooms, f.bathrooms, f.parking,
    f.minPrice, f.maxPrice, f.minArea, f.maxArea,
  ].filter((v) => v !== undefined).length;
}
