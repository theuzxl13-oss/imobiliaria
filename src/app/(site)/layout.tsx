import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { getSettings } from "@/lib/queries";
import { whatsappHref } from "@/lib/site";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  const waHref = whatsappHref(settings);

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Pular para o conteúdo
      </a>
      <Header
        companyName={settings.company_name}
        logoUrl={settings.logo_url}
        phone={settings.phone}
        whatsappHref={waHref}
      />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} />
      <WhatsAppFloat href={waHref} />
    </>
  );
}
