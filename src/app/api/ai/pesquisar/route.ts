import { NextResponse } from "next/server";
import { buildPesquisaPrompt } from "@/lib/ai/prompts";

export async function POST(req: Request) {
  try {
    const { query, destino } = await req.json();

    if (!query || !destino) {
      return NextResponse.json(
        { error: "Query e destino são obrigatórios" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key não configurada" },
        { status: 500 }
      );
    }

    const prompt = buildPesquisaPrompt(destino, query);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ googleSearch: {} }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await res.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json(
        { error: "Sem resposta da IA", lugares: [], dicas: [] },
        { status: 200 }
      );
    }

    const text = data.candidates[0].content.parts[0].text;

    // Extract JSON from response (handle possible markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Resposta inválida", lugares: [], dicas: [] },
        { status: 200 }
      );
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err) {
    console.error("AI research error:", err);
    return NextResponse.json(
      { error: "Erro interno", lugares: [], dicas: [] },
      { status: 500 }
    );
  }
}
