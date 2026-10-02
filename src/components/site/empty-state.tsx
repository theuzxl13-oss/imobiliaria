import Link from "next/link";
import { SearchX } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  title = "Nenhum imóvel encontrado",
  description = "Não encontramos imóveis com os filtros selecionados. Tente ampliar a busca ou fale com a nossa equipe — podemos encontrar o imóvel ideal para você.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="rounded-2xl bg-brand-50 p-4 text-brand-600">
        <SearchX className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-brand-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {action ?? (
          <>
            <Link href="/imoveis" className="btn btn-outline">Ver todos os imóveis</Link>
            <Link href="/contato" className="btn btn-primary">Falar com um corretor</Link>
          </>
        )}
      </div>
    </div>
  );
}
