import type { LeadStatus, PropertyStatus, Purpose } from "./types";

export const PURPOSE_LABEL: Record<Purpose, string> = {
  venda: "Venda",
  aluguel: "Aluguel",
};

export const PURPOSE_BADGE: Record<Purpose, string> = {
  venda: "À venda",
  aluguel: "Para alugar",
};

export const STATUS_LABEL: Record<PropertyStatus, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
  alugado: "Alugado",
  indisponivel: "Indisponível",
};

export const STATUS_STYLE: Record<PropertyStatus, string> = {
  disponivel: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  reservado: "bg-amber-50 text-amber-700 ring-amber-600/20",
  vendido: "bg-sky-50 text-sky-700 ring-sky-600/20",
  alugado: "bg-violet-50 text-violet-700 ring-violet-600/20",
  indisponivel: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  novo: "Novo",
  em_atendimento: "Em atendimento",
  contato_realizado: "Contato realizado",
  visita_agendada: "Visita agendada",
  finalizado: "Finalizado",
};

export const LEAD_STATUS_STYLE: Record<LeadStatus, string> = {
  novo: "bg-rose-50 text-rose-700 ring-rose-600/20",
  em_atendimento: "bg-amber-50 text-amber-700 ring-amber-600/20",
  contato_realizado: "bg-sky-50 text-sky-700 ring-sky-600/20",
  visita_agendada: "bg-violet-50 text-violet-700 ring-violet-600/20",
  finalizado: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

export const BRAZIL_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export const PAGE_SIZE = 12;

/** Faixas de preço do buscador da página inicial. */
export const PRICE_RANGES: Record<Purpose, { label: string; min?: number; max?: number }[]> = {
  venda: [
    { label: "Até R$ 200 mil", max: 200000 },
    { label: "R$ 200 mil a R$ 400 mil", min: 200000, max: 400000 },
    { label: "R$ 400 mil a R$ 700 mil", min: 400000, max: 700000 },
    { label: "R$ 700 mil a R$ 1 milhão", min: 700000, max: 1000000 },
    { label: "Acima de R$ 1 milhão", min: 1000000 },
  ],
  aluguel: [
    { label: "Até R$ 1.000", max: 1000 },
    { label: "R$ 1.000 a R$ 2.000", min: 1000, max: 2000 },
    { label: "R$ 2.000 a R$ 3.500", min: 2000, max: 3500 },
    { label: "R$ 3.500 a R$ 6.000", min: 3500, max: 6000 },
    { label: "Acima de R$ 6.000", min: 6000 },
  ],
};

export const SORT_OPTIONS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "maior-area", label: "Maior área" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];
