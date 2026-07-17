import Link from "next/link";
import {
  MapPin,
  Calendar,
  Share2,
  Compass,
  Plane,
  Stamp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const manifesto = [
  {
    icon: Compass,
    title: "Mapa interativo",
    description:
      "Busque lugares de verdade no Google Maps e veja cada parada do roteiro no mapa, colorida por tipo.",
    code: "01",
  },
  {
    icon: Calendar,
    title: "Dia a dia, arrastando",
    description:
      "Organize a viagem em dias com horários. Reordene arrastando — sem planilha, sem Word.",
    code: "02",
  },
  {
    icon: Share2,
    title: "Compartilhe de verdade",
    description:
      "Link público pra quem só quer ver, ou convide alguém pra editar o roteiro junto com você.",
    code: "03",
  },
  {
    icon: Stamp,
    title: "Contexto automático",
    description:
      "Foto e resumo do destino, previsão do tempo, câmbio e feriados locais — tudo puxado sozinho.",
    code: "04",
  },
];

const roteiroExemplo = [
  { hora: "09:00", local: "Cristo Redentor", tipo: "atracao" as const },
  { hora: "13:00", local: "Confeitaria Colombo", tipo: "restaurante" as const },
  { hora: "19:00", local: "Pôr do sol no Arpoador", tipo: "atracao" as const },
];

const CORES: Record<string, string> = {
  atracao: "#3b82f6",
  restaurante: "#f59e0b",
};

const steps = [
  {
    number: "1",
    title: "Crie o roteiro",
    description: "Destino, datas — pronto, os dias já aparecem.",
  },
  {
    number: "2",
    title: "Monte o dia a dia",
    description: "Busque lugares e arraste pra ordem certa.",
  },
  {
    number: "3",
    title: "Carimbe e compartilhe",
    description: "Link público ou convite pra editar junto.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-6xl">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading font-semibold text-xl tracking-tight italic"
          >
            <MapPin className="h-6 w-6 text-primary not-italic" />
            <span>Destino Certo</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-cta text-cta-foreground hover:bg-cta/90">
                Começar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-paper text-paper-foreground bg-grain overflow-hidden">
          <div className="container mx-auto max-w-6xl px-4 py-20 md:py-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-primary mb-6">
                <Plane className="h-3.5 w-3.5" />
                Itinerário de viagem
              </span>
              <h1 className="font-heading text-5xl md:text-7xl font-medium leading-[0.95] tracking-tight mb-6">
                Sua viagem,
                <br />
                <em className="italic font-normal text-primary">organizada</em>{" "}
                de verdade.
              </h1>
              <p className="text-lg md:text-xl text-paper-foreground/70 max-w-lg mb-10 leading-relaxed">
                Chega de roteiro perdido no Word. Monte dia a dia com mapa,
                arraste pra reordenar, e compartilhe com quem for junto.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button
                    size="lg"
                    className="text-base px-8 bg-cta text-cta-foreground hover:bg-cta/90 shadow-lg shadow-cta/25 w-full sm:w-auto"
                  >
                    Criar roteiro grátis
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-base px-8 w-full sm:w-auto">
                    Entrar com Google
                  </Button>
                </Link>
              </div>
            </div>

            {/* Decorative boarding pass */}
            <div
              className="relative bg-card text-card-foreground rounded-2xl shadow-2xl shadow-black/10 ticket-notch overflow-hidden rotate-2 hover:rotate-0 transition-transform duration-500 mx-auto w-full max-w-sm"
              aria-hidden="true"
            >
              <div className="px-6 py-5 bg-primary text-primary-foreground flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] opacity-80">Destino</p>
                  <p className="font-heading text-xl font-medium">Rio de Janeiro</p>
                </div>
                <Stamp className="h-8 w-8 opacity-70" />
              </div>
              <div className="px-6 py-2">
                <div className="h-0 border-t-2 border-dashed border-border" />
              </div>
              <ul className="px-6 py-5 space-y-4">
                {roteiroExemplo.map((item) => (
                  <li key={item.local} className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CORES[item.tipo] }}
                    />
                    <span className="text-xs font-medium text-muted-foreground w-11 shrink-0">
                      {item.hora}
                    </span>
                    <span className="text-sm truncate">{item.local}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Manifesto / features */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="max-w-xl mb-16">
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary">
                O que você leva na bagagem
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-tight mt-3">
                Tudo que um roteiro precisa, nada que ele não precisa.
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
              {manifesto.map((f) => (
                <div key={f.title} className="flex gap-5">
                  <div className="shrink-0">
                    <span className="font-heading text-3xl text-primary/30 font-medium">
                      {f.code}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <f.icon className="h-4 w-4 text-cta" />
                      <h3 className="font-heading font-medium text-lg">{f.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section className="py-24 px-4 bg-muted/40 border-y border-border/60">
          <div className="container mx-auto max-w-6xl">
            <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-tight text-center mb-16">
              Três carimbos até a viagem pronta
            </h2>
            <div className="relative grid md:grid-cols-3 gap-12">
              <div
                className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-px route-dashed"
                aria-hidden="true"
              />
              {steps.map((s) => (
                <div key={s.number} className="relative text-center">
                  <div className="relative z-10 w-16 h-16 mx-auto mb-5 rounded-full border-2 border-primary text-primary flex items-center justify-center bg-background -rotate-6">
                    <span className="font-heading text-2xl font-medium">{s.number}</span>
                  </div>
                  <h3 className="font-heading font-medium text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground max-w-[220px] mx-auto">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="relative bg-primary text-primary-foreground rounded-3xl ticket-notch bg-grain px-8 py-16 md:py-20 text-center overflow-hidden">
              <h2 className="font-heading text-3xl md:text-5xl font-medium tracking-tight mb-4">
                Próxima parada: <em className="italic font-normal">sua viagem</em>
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
                Grátis pra criar. Sem cartão, sem instalar nada — funciona até
                offline.
              </p>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-base px-8 bg-white text-primary hover:bg-white/90 shadow-lg"
                >
                  Começar agora
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-heading font-medium italic">
            <MapPin className="h-4 w-4 text-primary not-italic" />
            <span>Destino Certo</span>
          </div>
          <p>Feito para viajantes que gostam de organização.</p>
        </div>
      </footer>
    </div>
  );
}
