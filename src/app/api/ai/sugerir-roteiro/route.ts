import { NextResponse } from "next/server";
import { buildSugestaoRoteiroPrompt } from "@/lib/ai/prompts";

export async function POST(req: Request) {
  try {
    const { destino, numeroDias, interesses } = await req.json();

    if (!destino || !numeroDias) {
      return NextResponse.json(
        { error: "Destino e número de dias são obrigatórios" },
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

    const prompt = buildSugestaoRoteiroPrompt(
      destino,
      numeroDias,
      interesses || ""
    );

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    const data = await res.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json(
        { error: "Sem resposta da IA", dias: [], dicasGerais: [] },
        { status: 200 }
      );
    }

    const text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Resposta inválida", dias: [], dicasGerais: [] },
        { status: 200 }
      );
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err) {
    console.error("AI itinerary error:", err);
    return NextResponse.json(
      { error: "Erro interno", dias: [], dicasGerais: [] },
      { status: 500 }
    );
  }
}
