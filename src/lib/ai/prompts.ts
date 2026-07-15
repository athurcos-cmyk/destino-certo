export function buildPesquisaPrompt(destino: string, query: string): string {
  return `Você é um assistente de viagens especializado no Brasil.
O usuário está planejando uma viagem para ${destino}.

Pesquise na internet informações atualizadas sobre: ${query}

Retorne APENAS um JSON válido neste formato exato, sem markdown, sem \`\`\`json:

{
  "lugares": [
    {
      "nome": "Nome do lugar",
      "descricao": "2-3 frases sobre o lugar",
      "endereco": "Endereço completo se disponível",
      "tipo": "atracao|restaurante|hospedagem|transporte|outro",
      "porQue": "Por que este lugar é recomendado para esta viagem",
      "horarioFuncionamento": "Horário típico se disponível",
      "precoMedio": "Faixa de preço se disponível (R$)"
    }
  ],
  "dicas": ["Dica útil sobre a área ou o tema pesquisado"]
}

Seja específico e baseie-se em informações reais e atualizadas. Retorne no máximo 8 lugares.`;
}

export function buildSugestaoRoteiroPrompt(
  destino: string,
  numeroDias: number,
  interesses: string
): string {
  return `Você é um assistente de viagens especializado no Brasil.
O usuário vai viajar para ${destino} por ${numeroDias} dias.
Interesses: ${interesses || "geral (turismo, gastronomia, cultura)"}.

Pesquise e sugira um roteiro dia a dia realista e bem distribuído geograficamente.
Retorne APENAS um JSON válido neste formato exato, sem markdown, sem \`\`\`json:

{
  "dias": [
    {
      "numeroDia": 1,
      "tema": "Tema do dia (ex: Centro Histórico)",
      "paradas": [
        {
          "nome": "Nome do lugar",
          "horarioSugerido": "09:00",
          "duracaoEstimada": "2h",
          "descricao": "Breve descrição do lugar e do que fazer",
          "tipo": "atracao|restaurante|hospedagem|transporte|outro"
        }
      ]
    }
  ],
  "dicasGerais": ["Dica prática sobre a viagem"]
}

Regras importantes:
- Distribua as paradas de forma geograficamente lógica (lugares próximos no mesmo dia)
- Inclua horários de almoço (12:00-13:30) em restaurantes
- Máximo 5 paradas por dia
- Comece cada dia entre 08:00 e 10:00
- Termine cada dia até 20:00
- Seja específico com nomes reais de lugares`;
}
