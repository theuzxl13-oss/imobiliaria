import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card p-10 text-center">
      <h1 className="text-xl font-bold text-brand-950">Registro não encontrado</h1>
      <p className="mt-1 text-sm text-slate-500">Ele pode ter sido excluído.</p>
      <Link href="/admin/imoveis" className="btn btn-primary mt-5">Voltar para imóveis</Link>
    </div>
  );
}
