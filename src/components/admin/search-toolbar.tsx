"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { Search } from "lucide-react";

/** Barra de busca + filtros (select) que atualiza a URL. */
export function SearchToolbar({
  placeholder,
  selects,
}: {
  placeholder: string;
  selects: { name: string; label: string; options: { value: string; label: string }[] }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("pagina");
    if (value) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    update("q", q.trim());
  }

  return (
    <div className="card mb-4 flex flex-col gap-3 p-3 md:flex-row md:items-center">
      <form onSubmit={submit} className="relative flex-1" role="search">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="field pl-9"
          aria-label="Buscar"
        />
      </form>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        {selects.map((s) => (
          <select
            key={s.name}
            aria-label={s.label}
            className="field sm:w-auto"
            value={searchParams.get(s.name) ?? ""}
            onChange={(e) => update(s.name, e.target.value)}
          >
            <option value="">{s.label}</option>
            {s.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}
      </div>
    </div>
  );
}

export function TableEmpty({ children }: { children: ReactNode }) {
  return <div className="card px-6 py-14 text-center text-sm text-slate-500">{children}</div>;
}
