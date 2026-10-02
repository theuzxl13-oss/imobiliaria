import Link from "next/link";
import { Home, Search } from "lucide-react";

export function NotFoundContent() {
  return (
    <div className="container-site flex flex-col items-center py-20 text-center sm:py-28">
      <p className="text-7xl font-extrabold text-brand-100 sm:text-8xl">404</p>
      <h1 className="mt-2 text-2xl font-extrabold text-brand-950 sm:text-3xl">Página não encontrada</h1>
      <p className="mt-3 max-w-md text-slate-500">
        O endereço acessado não existe ou o imóvel não está mais disponível. Que tal continuar sua busca?
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-outline">
          <Home className="h-4 w-4" /> Página inicial
        </Link>
        <Link href="/imoveis" className="btn btn-primary">
          <Search className="h-4 w-4" /> Buscar imóveis
        </Link>
      </div>
    </div>
  );
}
