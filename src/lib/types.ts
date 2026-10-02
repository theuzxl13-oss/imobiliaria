export type Purpose = "venda" | "aluguel";

export type PropertyStatus = "disponivel" | "reservado" | "vendido" | "alugado" | "indisponivel";

export type LeadStatus =
  | "novo"
  | "em_atendimento"
  | "contato_realizado"
  | "visita_agendada"
  | "finalizado";

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface Feature {
  id: string;
  name: string;
  sort_order: number;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  storage_path: string | null;
  position: number;
  is_cover: boolean;
}

export interface Property {
  id: string;
  code: string;
  title: string;
  description: string;
  purpose: Purpose;
  category_id: string | null;
  status: PropertyStatus;
  is_published: boolean;
  is_featured: boolean;
  is_offer: boolean;
  price: number;
  promo_price: number | null;
  effective_price: number;
  zip_code: string;
  state: string;
  city: string;
  neighborhood: string;
  address: string;
  address_number: string;
  complement: string;
  show_address: boolean;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parking_spots: number;
  total_area: number | null;
  built_area: number | null;
  condo_fee: number | null;
  iptu: number | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

/** Imóvel com a categoria embutida (listagens). */
export type PropertyListItem = Property & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
};

/** Imóvel completo (página do imóvel / edição). */
export type PropertyDetail = PropertyListItem & {
  images: PropertyImage[];
  features: Feature[];
};

export interface Lead {
  id: string;
  property_id: string | null;
  property_code: string | null;
  property_title: string | null;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: LeadStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ListingRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  property_type: string;
  purpose: Purpose;
  city: string;
  neighborhood: string;
  approximate_value: number | null;
  description: string;
  status: LeadStatus;
  notes: string;
  created_at: string;
}

export interface SiteSettings {
  company_name: string;
  logo_url: string | null;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  business_hours: string;
  about_text: string;
  creci: string;
}

export interface StatusHistoryEntry {
  id: number;
  old_status: PropertyStatus | null;
  new_status: PropertyStatus;
  changed_at: string;
}

/** Resultado padrão das Server Actions. */
export type ActionResult<T = undefined> =
  | ({ ok: true; message?: string } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
