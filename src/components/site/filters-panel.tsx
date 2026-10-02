"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { PropertyFilters } from "@/lib/filters";
import type { Category, Purpose } from "@/lib/types";
import { cn } from "@/lib/cn";

type Locations = { city: string; neighborhoods: string[] }[];

const COUNT_OPTIONS = [1, 2, 3, 4];

function toInput(value?: number) {
  return value === undefined ? "" : String(value);
}

function CountGroup({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="field-label">{label}</legend>
      <div className="grid grid-cols-5 gap-1.5">
        {["", ...COUNT_OPTIONS.map(String)].map((opt) => (
          <button
            key={opt || "any"}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            className={cn(
              "rounded-lg border py-2 text-xs font-bold transition",
              value === opt
                ? "border-brand-700 bg-brand-800 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-brand-300",
            )}
          >
            {opt === "" ? "Todos" : `${opt}+`}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function FiltersPanel({
  filters,
  categories,
  locations,
  fixedPurpose,
  activeCount,
}: {
  filters: PropertyFilters;
  categories: Category[];
  locations: Locations;
  fixedPurpose?: Purpose;
  activeCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const [values, setValues] = useState(() => ({
    finalidade: filters.purpose ?? "",
    q: filters.q ?? "",
    cidade: filters.city ?? "",
    bairro: filters.neighborhood ?? "",
    tipo: filters.category ?? "",
    quartos: toInput(filters.bedrooms),
    banheiros: toInput(filters.bathrooms),
    vagas: toInput(filters.parking),
    preco_min: toInput(filters.minPrice),
    preco_max: toInput(filters.maxPrice),
    area_min: toInput(filters.minArea),
    area_max: toInput(filters.maxArea),
  }));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const set = (key: keyof typeof values) => (v: string) =>
    setValues((prev) => ({ ...prev, [key]: v, ...(key === "cidade" ? { bairro: "" } : {}) }));

  const neighborhoods = values.cidade
    ? (locations.find((l) => l.city === values.cidade)?.neighborhoods ?? [])
    : [...new Set(locations.flatMap((l) => l.neighborhoods))].sort((a, b) => a.localeCompare(b, "pt-BR"));

  function apply(e?: FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      if (key === "finalidade" && fixedPurpose) continue;
      if (value.trim()) params.set(key, value.trim());
    }
    const sort = searchParams.get("ordem");
    if (sort) params.set("ordem", sort);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setOpen(false);
  }

  function clear() {
    const sort = searchParams.get("ordem");
    router.push(sort ? `${pathname}?ordem=${sort}` : pathname, { scroll: false });
    setOpen(false);
  }

  const form = (
    <form onSubmit={apply} className="space-y-5">
      {!fixedPurpose && (
        <div>
          <span className="field-label">Negociação</span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              ["", "Todos"],
              ["venda", "Venda"],
              ["aluguel", "Aluguel"],
            ].map(([v, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => set("finalidade")(v)}
                aria-pressed={values.finalidade === v}
                className={cn(
                  "rounded-lg border py-2 text-xs font-bold transition",
                  values.finalidade === v
                    ? "border-brand-700 bg-brand-800 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-brand-300",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="f-q" className="field-label">Palavra-chave ou código</label>
        <input
          id="f-q"
          className="field"
          value={values.q}
          onChange={(e) => set("q")(e.target.value)}
          placeholder="Ex.: piscina, Centro, 0001"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        <div>
          <label htmlFor="f-cidade" className="field-label">Cidade</label>
          <select id="f-cidade" className="field" value={values.cidade} onChange={(e) => set("cidade")(e.target.value)}>
            <option value="">Todas</option>
            {locations.map((l) => (
              <option key={l.city} value={l.city}>{l.city}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-bairro" className="field-label">Bairro</label>
          <select id="f-bairro" className="field" value={values.bairro} onChange={(e) => set("bairro")(e.target.value)}>
            <option value="">Todos</option>
            {neighborhoods.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="f-tipo" className="field-label">Tipo de imóvel</label>
        <select id="f-tipo" className="field" value={values.tipo} onChange={(e) => set("tipo")(e.target.value)}>
          <option value="">Todos os tipos</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <CountGroup label="Quartos" value={values.quartos} onChange={set("quartos")} />
      <CountGroup label="Banheiros" value={values.banheiros} onChange={set("banheiros")} />
      <CountGroup label="Vagas" value={values.vagas} onChange={set("vagas")} />

      <fieldset>
        <legend className="field-label">Valor (R$)</legend>
        <div className="grid grid-cols-2 gap-2">
          <input
            className="field"
            inputMode="numeric"
            placeholder="Mínimo"
            aria-label="Valor mínimo"
            value={values.preco_min}
            onChange={(e) => set("preco_min")(e.target.value.replace(/[^\d]/g, ""))}
          />
          <input
            className="field"
            inputMode="numeric"
            placeholder="Máximo"
            aria-label="Valor máximo"
            value={values.preco_max}
            onChange={(e) => set("preco_max")(e.target.value.replace(/[^\d]/g, ""))}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="field-label">Área total (m²)</legend>
        <div className="grid grid-cols-2 gap-2">
          <input
            className="field"
            inputMode="numeric"
            placeholder="Mínima"
            aria-label="Área mínima"
            value={values.area_min}
            onChange={(e) => set("area_min")(e.target.value.replace(/[^\d]/g, ""))}
          />
          <input
            className="field"
            inputMode="numeric"
            placeholder="Máxima"
            aria-label="Área máxima"
            value={values.area_max}
            onChange={(e) => set("area_max")(e.target.value.replace(/[^\d]/g, ""))}
          />
        </div>
      </fieldset>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={clear} className="btn btn-outline flex-1">
          Limpar
        </button>
        <button type="submit" className="btn btn-primary flex-[2]">
          Aplicar filtros
        </button>
      </div>
    </form>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-outline w-full lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filtros
        {activeCount > 0 && (
          <span className="rounded-full bg-brand-800 px-2 py-0.5 text-[11px] text-white">{activeCount}</span>
        )}
      </button>

      <aside className="card sticky top-24 hidden p-5 lg:block" aria-label="Filtros">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-brand-950">
          <SlidersHorizontal className="h-4 w-4 text-gold-500" />
          Busca avançada
        </h2>
        {form}
      </aside>

      {/* Gaveta mobile */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", open ? "" : "pointer-events-none")} aria-hidden={!open}>
        <div
          className={cn("absolute inset-0 bg-brand-950/50 transition-opacity", open ? "opacity-100" : "opacity-0")}
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl transition-transform duration-300",
            open ? "translate-y-0" : "translate-y-full",
          )}
          role="dialog"
          aria-label="Filtros"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-950">Filtrar imóveis</h2>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost p-2" aria-label="Fechar filtros">
              <X className="h-5 w-5" />
            </button>
          </div>
          {open && form}
        </div>
      </div>
    </>
  );
}
