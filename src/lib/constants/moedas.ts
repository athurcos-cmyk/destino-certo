// Mapa país (ISO 3166-1 alpha-2) -> moeda (ISO 4217).
// A API de câmbio (Frankfurter/BCE) só cobre um conjunto fixo de ~30 moedas
// "maiores" — a maioria das moedas sul-americanas (ARS, CLP, COP, PEN, BOB,
// PYG, UYU, VES) NÃO está disponível ali, então não entram aqui. País fora
// deste mapa = sem widget de câmbio (não adivinha, não mostra número errado).
export const PAIS_MOEDA: Record<string, string> = {
  EC: "USD", // Equador usa dólar oficialmente
  US: "USD",
  CA: "CAD",
  MX: "MXN",
  GB: "GBP",
  JP: "JPY",
  AU: "AUD",
  CH: "CHF",
  CN: "CNY",
  KR: "KRW",
  IN: "INR",
  TH: "THB",
  SG: "SGD",
  IL: "ILS",
  ID: "IDR",
  PH: "PHP",
  TR: "TRY",
  ZA: "ZAR",
  // Zona do Euro
  PT: "EUR",
  ES: "EUR",
  FR: "EUR",
  IT: "EUR",
  DE: "EUR",
  NL: "EUR",
  IE: "EUR",
  GR: "EUR",
  AT: "EUR",
  BE: "EUR",
};
