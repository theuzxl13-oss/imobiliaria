import {
  Building,
  Building2,
  House,
  LandPlot,
  LayoutGrid,
  Store,
  Tractor,
  Trees,
  Wheat,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  casa: House,
  apartamento: Building2,
  terreno: LandPlot,
  comercial: Store,
  chacara: Trees,
  sitio: Tractor,
  fazenda: Wheat,
  condominio: Building,
};

export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = ICONS[slug] ?? LayoutGrid;
  return <Icon className={className} aria-hidden />;
}
