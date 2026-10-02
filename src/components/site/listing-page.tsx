import { Suspense } from "react";
import { FiltersPanel } from "./filters-panel";
import { PropertyGrid } from "./property-card";
import { Pagination } from "./pagination";
import { SortSelect } from "./sort-select";
import { EmptyState } from "./empty-state";
import { getCategories, getLocations, searchProperties } from "@/lib/queries";
import { countActiveFilters, parseFilters, type PropertyFilters, type RawSearchParams } from "@/lib/filters";
import { pluralize } from "@/lib/format";

/** Listagem com busca avançada, ordenação e paginação (usada em várias páginas). */
export async function ListingPage({
  searchParams,
  basePath,
  forced,
}: {
  searchParams: RawSearchParams;
  basePath: string;
  forced?: Partial<PropertyFilters>;
}) {
  const filters = parseFilters(searchParams, forced);
  const [result, categories, locations] = await Promise.all([
    searchProperties(filters),
    getCategories(),
    getLocations(),
  ]);

  return (
    <div className="container-site grid gap-6 py-8 lg:grid-cols-[300px_1fr] lg:py-10">
      <div>
        <Suspense>
          <FiltersPanel
            // Recria o painel quando a URL muda (ex.: botão voltar do navegador)
            key={JSON.stringify(searchParams)}
            filters={filters}
            categories={categories}
            locations={locations}
            fixedPurpose={forced?.purpose}
            activeCount={countActiveFilters(filters)}
          />
        </Suspense>
      </div>
      <div className="min-w-0">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600" aria-live="polite">
            <strong className="text-brand-950">
              {pluralize(result.total, "imóvel encontrado", "imóveis encontrados")}
            </strong>
          </p>
          <Suspense>
            <SortSelect value={filters.sort} />
          </Suspense>
        </div>
        {result.items.length > 0 ? (
          <>
            <PropertyGrid properties={result.items} priorityCount={3} withSidebar />
            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              basePath={basePath}
              params={searchParams}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
