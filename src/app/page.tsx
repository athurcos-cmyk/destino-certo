import Link from "next/link";
import { MapPin, Calendar, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: MapPin,
    title: "Mapa Interativo",
    description:
      "Visualize todos os lugares do seu roteiro no mapa. Busque por restaurantes, atrações e muito mais.",
  },
  {
    icon: Calendar,
    title: "Roteiro Dia a Dia",
    description:
      "Organize sua viagem dia por dia, com horários para cada parada. Simples como arrastar e soltar.",
  },
  {
    icon: Share2,
    title: "Compartilhe com Todos",
    description:
      "Gere um link e compartilhe o roteiro com família e amigos. Eles visualizam sem precisar criar conta.",
  },
  {
    icon: Sparkles,
    title: "Assistente com IA",
    description:
      "Não sabe o que visitar? A IA pesquisa lugares incríveis e até sugere roteiros completos para você.",
  },
];

const steps = [
  {
    number: "1",
    title: "Crie seu roteiro",
    description: "Defina o destino e as datas da viagem.",
  },
  {
    number: "2",
    title: "Adicione lugares",
    description: "Busque no mapa e monte seu dia a dia.",
  },
  {
    number: "3",
    title: "Compartilhe o link",
    description: "Envie para quem quiser e pronto!",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-6xl">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight"
          >
            <MapPin className="h-6 w-6 text-sky-500" />
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
        {/* Hero com Aurora gradient */}
        <section className="relative overflow-hidden py-24 md:py-36 px-4">
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute top-0 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-sky-300/40 via-sky-200/20 to-transparent blur-3xl animate-[aurora_12s_ease-in-out_infinite]" />
            <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-orange-300/25 via-amber-200/15 to-transparent blur-3xl animate-[aurora_10s_ease-in-out_infinite_reverse]" />
            <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-emerald-300/20 via-teal-200/10 to-transparent blur-3xl animate-[aurora_14s_ease-in-out_infinite]" />
          </div>

          <div className="container mx-auto max-w-6xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Seu roteiro de viagem
              <br />
              <span className="text-primary">organizado e compartilhável</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Chega de fazer roteiro no Word. Crie itinerários dia a dia com
              mapa interativo, arraste e solte, e compartilhe com um link.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button
                  size="lg"
                  className="text-base px-8 bg-cta text-cta-foreground hover:bg-cta/90 shadow-lg shadow-cta/25"
                >
                  Criar Roteiro Grátis
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8"
                >
                  Entrar com Google
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features com glassmorphism */}
        <section className="py-20 bg-muted/50 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Por que usar o Destino Certo?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-sky-100 hover:shadow-lg hover:shadow-sky-100/50 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-500 rounded-lg flex items-center justify-center mb-4 shadow-sm shadow-sky-400/20">
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works com círculos gradientes */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Como funciona
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((s) => (
                <div key={s.number} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-md shadow-sky-400/25">
                    {s.number}
                  </div>
                  <h3 className="font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA com gradiente */}
        <section className="py-20 bg-gradient-to-br from-sky-500 to-sky-600 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para planejar sua próxima viagem?
            </h2>
            <p className="text-white/80 mb-8">
              Crie sua conta gratuita e comece a montar roteiros incríveis.
            </p>
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="text-base px-8 bg-white text-sky-700 hover:bg-white/90 shadow-lg"
              >
                Começar Agora
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-heading font-medium">
            <MapPin className="h-4 w-4 text-sky-500" />
            <span>Destino Certo</span>
          </div>
          <p>Feito para viajantes que gostam de organização.</p>
        </div>
      </footer>
    </div>
  );
}
