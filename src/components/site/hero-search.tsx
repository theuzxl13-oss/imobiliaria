"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Building2, MapPin, Search, Wallet } from "lucide-react";
import { PRICE_RANGES } from "@/lib/constants";
import type { Category, Purpose } from "@/lib/types";
import { cn } from "@/lib/cn";

export function HeroSearch({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [purpose, setPurpose] = useState<Purpose>("venda");
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [range, setRange] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (type) params.set("tipo", type);
    const selected = range === "" ? null : PRICE_RANGES[purpose][Number(range)];
    if (selected?.min !== undefined) params.set("preco_min", String(selected.min));
    if (selected?.max !== undefined) params.set("preco_max", String(selected.max));
    const base = purpose === "venda" ? "/comprar" : "/alugar";
    const qs = params.toString();
    router.push(qs ? `${base}?${qs}` : base);
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Buscar imóveis"
      className="w-full rounded-2xl bg-white p-2 shadow-2xl shadow-brand-950/30 sm:p-3"
    >
      <div className="flex gap-1 p-1" role="tablist" aria-label="Tipo de negociação">
        {(
          [
            ["venda", "Comprar"],
            ["aluguel", "Alugar"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={purpose === value}
            onClick={() => {
              setPurpose(value);
              setRange("");
            }}
            className={cn(
              "rounded-lg px-5 py-2 text-sm font-bold transition",
              purpose === value ? "bg-brand-800 text-white" : "text-slate-600 hover:bg-slate-100",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-2 grid gap-2 md:grid-cols-[1.4fr_1fr_1fr_auto]">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
          <MapPin className="h-5 w-5 shrink-0 text-gold-500" />
          <span className="sr-only">Cidade ou bairro</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cidade ou bairro"
            className="w-full bg-transparent py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
          <Building2 className="h-5 w-5 shrink-0 text-gold-500" />
          <span className="sr-only">Tipo do imóvel</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-transparent py-3.5 text-sm text-slate-900 outline-none"
          >
            <option value="">Tipo do imóvel</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
          <Wallet className="h-5 w-5 shrink-0 text-gold-500" />
          <span className="sr-only">Faixa de preço</span>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="w-full bg-transparent py-3.5 text-sm text-slate-900 outline-none"
          >
            <option value="">Faixa de preço</option>
            {PRICE_RANGES[purpose].map((r, i) => (
              <option key={r.label} value={i}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-gold py-3.5 text-base md:px-7">
          <Search className="h-5 w-5" />
          Buscar imóveis
        </button>
      </div>
    </form>
  );
}
