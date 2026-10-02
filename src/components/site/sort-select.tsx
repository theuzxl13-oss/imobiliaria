"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/constants";

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <span className="hidden sm:inline">Ordenar por</span>
      <select
        className="field w-auto py-2"
        value={value}
        aria-label="Ordenar imóveis"
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("pagina");
          if (e.target.value === "recentes") params.delete("ordem");
          else params.set("ordem", e.target.value);
          const qs = params.toString();
          router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
