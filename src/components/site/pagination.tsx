import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RawSearchParams } from "@/lib/filters";
import { cn } from "@/lib/cn";

function pageHref(basePath: string, params: RawSearchParams, page: number) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const v = Array.isArray(value) ? value[0] : value;
    if (v && key !== "pagina") qs.set(key, v);
  }
  if (page > 1) qs.set("pagina", String(page));
  const s = qs.toString();
  return s ? `${basePath}?${s}` : basePath;
}

function pageList(current: number, total: number) {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("…");
    result.push(p);
  });
  return result;
}

export function Pagination({
  page,
  pageCount,
  basePath,
  params,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  params: RawSearchParams;
}) {
  if (pageCount <= 1) return null;
  const linkClass =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition";

  return (
    <nav aria-label="Paginação" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 && (
        <Link
          href={pageHref(basePath, params, page - 1)}
          className={cn(linkClass, "border-slate-200 bg-white text-slate-700 hover:border-brand-300")}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}
      {pageList(page, pageCount).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-slate-400">…</span>
        ) : (
          <Link
            key={p}
            href={pageHref(basePath, params, p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              linkClass,
              p === page
                ? "border-brand-800 bg-brand-800 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-brand-300",
            )}
          >
            {p}
          </Link>
        ),
      )}
      {page < pageCount && (
        <Link
          href={pageHref(basePath, params, page + 1)}
          className={cn(linkClass, "border-slate-200 bg-white text-slate-700 hover:border-brand-300")}
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
