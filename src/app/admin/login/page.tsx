import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Logo } from "@/components/site/logo";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hero-pattern relative hidden flex-col justify-between p-12 text-white lg:flex">
        <Logo variant="light" />
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Painel administrativo</h1>
          <p className="mt-3 max-w-md text-slate-300">
            Cadastre imóveis, gerencie fotos, ofertas e destaques, e acompanhe todos os contatos recebidos pelo site.
          </p>
        </div>
        <p className="text-xs text-slate-400">Acesso restrito a administradores.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="text-2xl font-extrabold text-brand-950">Entrar no painel</h2>
          <p className="mt-1 mb-8 text-sm text-slate-500">Use o e-mail e a senha de administrador.</p>
          {!isSupabaseConfigured && (
            <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              O Supabase ainda não foi configurado. Defina as variáveis de ambiente (veja o README).
            </p>
          )}
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
