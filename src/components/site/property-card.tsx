import Link from "next/link";
import { ArrowRight, Bath, BedDouble, Car, MapPin, Ruler } from "lucide-react";
import { SafeImage } from "./safe-image";
import { PURPOSE_BADGE, STATUS_LABEL } from "@/lib/constants";
import {
  formatArea,
  formatPrice,
  hasActiveOffer,
  locationLabel,
  propertyPath,
} from "@/lib/format";
import type { PropertyListItem } from "@/lib/types";
import { cn } from "@/lib/cn";

export function PropertyCard({ property, priority }: { property: PropertyListItem; priority?: boolean }) {
  const offer = hasActiveOffer(property);
  const closed = property.status === "vendido" || property.status === "alugado";
  const area = property.built_area ?? property.total_area;

  return (
    <Link
      href={propertyPath(property)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-brand-500"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <SafeImage
          src={property.cover_image_url}
          alt={property.title}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={cn(
            "object-cover transition duration-500 group-hover:scale-105",
            closed && "grayscale-[60%]",
          )}
        />
        <div className="absolute inset-x-0 top-0 flex flex-wrap items-start gap-1.5 p-3">
          <span className="rounded-md bg-brand-900/90 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase backdrop-blur">
            {PURPOSE_BADGE[property.purpose]}
          </span>
          {offer && (
            <span className="rounded-md bg-rose-600 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-white uppercase">
              Oferta
            </span>
          )}
          {property.is_featured && (
            <span className="rounded-md bg-gold-400 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-brand-950 uppercase">
              Destaque
            </span>
          )}
        </div>
        <span className="absolute right-3 bottom-3 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-bold text-slate-700 backdrop-blur">
          Cód. {property.code}
        </span>
        {property.status !== "disponivel" && (
          <span
            className={cn(
              "absolute bottom-3 left-3 rounded-md px-2.5 py-1 text-[11px] font-extrabold tracking-wide uppercase",
              closed ? "bg-slate-900 text-white" : "bg-amber-400 text-amber-950",
            )}
          >
            {STATUS_LABEL[property.status]}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-xs font-semibold tracking-wide text-gold-600 uppercase">
          {property.category?.name ?? "Imóvel"}
        </p>
        <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-brand-950 group-hover:text-brand-700">
          {property.title}
        </h3>
        <p className="mt-1.5 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{locationLabel(property)}</span>
        </p>

        <ul className="mt-4 grid grid-cols-4 gap-1 border-y border-slate-100 py-3 text-xs text-slate-600">
          <li className="flex flex-col items-center gap-1" title="Quartos">
            <BedDouble className="h-4 w-4 text-brand-500" />
            <span>{property.bedrooms} qto{property.bedrooms === 1 ? "" : "s"}</span>
          </li>
          <li className="flex flex-col items-center gap-1" title="Banheiros">
            <Bath className="h-4 w-4 text-brand-500" />
            <span>{property.bathrooms} ban</span>
          </li>
          <li className="flex flex-col items-center gap-1" title="Vagas">
            <Car className="h-4 w-4 text-brand-500" />
            <span>{property.parking_spots} vg{property.parking_spots === 1 ? "" : "s"}</span>
          </li>
          <li className="flex flex-col items-center gap-1" title="Área">
            <Ruler className="h-4 w-4 text-brand-500" />
            <span className="whitespace-nowrap">{area ? formatArea(area) : "—"}</span>
          </li>
        </ul>

        <div className="mt-4 flex flex-1 items-end justify-between gap-3">
          <div className="min-w-0">
            {offer ? (
              <>
                <p className="text-xs text-slate-400">
                  DE: <span className="line-through">{formatPrice(property.price, property.purpose)}</span>
                </p>
                <p className="text-lg font-extrabold text-rose-600">
                  <span className="text-xs font-bold">POR: </span>
                  {formatPrice(property.promo_price!, property.purpose)}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-slate-400">{property.purpose === "aluguel" ? "Aluguel" : "Valor"}</p>
                <p className="text-lg font-extrabold text-brand-900">
                  {formatPrice(property.price, property.purpose)}
                </p>
              </>
            )}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-brand-50 px-3 py-2 text-xs font-bold text-brand-800 transition group-hover:bg-brand-800 group-hover:text-white">
            Ver imóvel
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-10 w-full rounded-lg" />
        <div className="skeleton h-6 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function PropertyGrid({
  properties,
  priorityCount = 0,
  withSidebar = false,
}: {
  properties: PropertyListItem[];
  priorityCount?: number;
  withSidebar?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-5 sm:grid-cols-2",
        withSidebar ? "lg:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4",
      )}
    >
      {properties.map((p, i) => (
        <PropertyCard key={p.id} property={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}

export function PropertyGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
