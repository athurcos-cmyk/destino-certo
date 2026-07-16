import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Destino Certo - Planejador de Viagens",
    short_name: "Destino Certo",
    description: "Crie e compartilhe roteiros de viagem com mapas interativos",
    start_url: "/app",
    display: "standalone",
    background_color: "#F0F9FF",
    theme_color: "#0EA5E9",
    icons: [
      { src: "/icons/Icon.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/Icon.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/Icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["travel", "productivity"],
    lang: "pt-BR",
  };
}
