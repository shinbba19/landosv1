import { NextRequest } from "next/server";

const STEP_NAMES: Record<number, string> = {
  1: "Land Input (ข้อมูลที่ดิน)",
  2: "Land Analysis (วิเคราะห์ที่ดิน)",
  3: "Development Cost (ต้นทุนพัฒนา)",
  4: "Financial Analysis (การวิเคราะห์การเงิน)",
  5: "Strategy Comparison (เปรียบเทียบกลยุทธ์)",
  6: "Executive Summary (สรุปผลการวิเคราะห์)",
};

function buildSystemPrompt(step: number, projectData: Record<string, unknown>): string {
  const { projectName, landInput, landAnalysis, devCost, financial } = projectData as {
    projectName: string;
    landInput: Record<string, unknown>;
    landAnalysis: Record<string, unknown>;
    devCost: Record<string, unknown>;
    financial: Record<string, unknown>;
  };

  const contextLines: string[] = [];

  if (projectName) contextLines.push(`Project: "${projectName}"`);
  if (landInput) {
    const { rai, ngan, sqWah, landPrice, location, zoningCode } = landInput as Record<string, unknown>;
    const totalSqWah = Number(rai) * 400 + Number(ngan) * 100 + Number(sqWah);
    if (totalSqWah > 0) contextLines.push(`Land size: ${rai} rai ${ngan} ngan ${sqWah} sqWah (= ${totalSqWah} sqWah total)`);
    if (location) contextLines.push(`Location: ${location}`);
    if (zoningCode) contextLines.push(`Zoning: ${zoningCode}`);
    if (Number(landPrice) > 0) contextLines.push(`Land price: ฿${Number(landPrice).toLocaleString()}`);
  }
  if (landAnalysis) {
    const { lotCount, lotSizeSqWah, roadDeductionPct, usableAreaSqWah } = landAnalysis as Record<string, unknown>;
    if (Number(lotCount) > 0) {
      contextLines.push(`Estimated lots: ${lotCount} plots × ${lotSizeSqWah} sqWah each`);
      contextLines.push(`Road deduction: ${roadDeductionPct}%, usable area: ${usableAreaSqWah} sqWah`);
    }
  }
  if (devCost) {
    const { totalInfraCost, preset } = devCost as Record<string, unknown>;
    if (Number(totalInfraCost) > 0) contextLines.push(`Infrastructure cost: ฿${Number(totalInfraCost).toLocaleString()} (${preset} preset)`);
  }
  if (financial) {
    const { sellingPricePerSqWah, grossProfit, roi } = financial as Record<string, unknown>;
    if (Number(sellingPricePerSqWah) > 0) {
      contextLines.push(`Selling price: ฿${Number(sellingPricePerSqWah).toLocaleString()}/sqWah`);
      contextLines.push(`Estimated profit: ฿${Number(grossProfit).toLocaleString()}, ROI: ${Number(roi).toFixed(1)}%`);
    }
  }

  return `You are LANDOS AI, an expert assistant for the LANDOS V1 land development feasibility system used in Thailand.

Your role is to help users understand:
- Thai land measurement units (rai = 400 sqWah = 1,600 sqm; 1 ngan = 100 sqWah; 1 sqWah = 4 sqm)
- Thai real estate concepts: zoning colors (yellow = low-density residential, orange = medium, red = commercial, green = agricultural), road deduction, lot subdivision
- Development cost estimation (road construction ~400-900 THB/sqm, utilities, fencing)
- Financial feasibility: ROI, gross margin, sensitivity analysis
- Quick Sell vs Develop & Sell decision making
- Good ROI benchmarks in Thai real estate: >20% is acceptable, >30% is good, >50% is excellent

The user is currently on: Step ${step} — ${STEP_NAMES[step] || "Unknown"}

${contextLines.length > 0 ? `Current project data:\n${contextLines.map((l) => `  - ${l}`).join("\n")}` : "No project data entered yet."}

Instructions:
- If the user writes in Thai, respond in Thai. If in English, respond in English.
- Keep answers concise and practical (2-4 sentences max unless detail is needed).
- When giving numbers, use Thai market context (prices in THB, areas in sqWah or rai).
- Never make up specific market prices — give reasonable ranges instead.
- Do not replace professional advice; remind users to consult experts for major decisions.`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return new Response("GEMINI_API_KEY not configured", { status: 500 });
  }

  let body: { messages: { role: string; text: string }[]; step: number; projectData: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  const { messages, step, projectData } = body;

  try {
    const systemPrompt = buildSystemPrompt(step, projectData);
    const history = messages.slice(0, -1).map((m: { role: string; text: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));
    const lastMessage = messages[messages.length - 1].text;

    // Inject system prompt as first user/model turn (works for ALL models)
    const contents = [
      { role: "user", parts: [{ text: `[SYSTEM]\n${systemPrompt}` }] },
      { role: "model", parts: [{ text: "Understood. I am LANDOS AI, ready to assist." }] },
      ...history,
      { role: "user", parts: [{ text: lastMessage }] },
    ];

    const reqBody = {
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    };

    // Try models on v1beta (supports newer models like 2.5-flash, 2.0-flash)
    const MODELS = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ];
    let geminiRes: Response | null = null;
    let usedModel = "";

    for (const modelName of MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      if (res.ok) {
        geminiRes = res;
        usedModel = modelName;
        break;
      }
      if (res.status !== 404) {
        const errText = await res.text();
        return new Response(`Gemini API error (${res.status}) [${modelName}]: ${errText}`, { status: 500 });
      }
    }

    if (!geminiRes) {
      return new Response("No Gemini models available for this API key. Check that the Generative Language API is enabled in your Google Cloud project.", { status: 500 });
    }

    const data = await geminiRes.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? `[${usedModel}: empty response]`;

    return new Response(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(`Gemini error: ${msg}`, { status: 500 });
  }
}
