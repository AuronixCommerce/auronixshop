import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Auronix admin AI",
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
    firebaseAdminConfigured: Boolean(process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY),
  });
}

export async function POST(request: Request) {
  try {
    // Load Admin SDK only inside the request so initialization failures are
    // returned as JSON instead of crashing the complete serverless route.
    const { requireAdmin } = await import("@/lib/server-admin");
    await requireAdmin(request);
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured in this deployment.");
    const body = await request.json();
    const brief = String(body.brief || "").trim().slice(0, 4000);
    const title = String(body.title || "").trim().slice(0, 300);
    const brand = String(body.brand || "").trim().slice(0, 150);
    if (!brief && !title) throw new Error("Add a product title or product brief first.");
    const prompt = `Create accurate ecommerce catalog copy for an Amazon affiliate listing. Do not invent technical specifications, ratings, reviews, prices, certifications, popularity, performance claims, or endorsements. Use only the supplied facts. Return strict JSON with keys shortDescription (max 240 chars), description (2-4 concise paragraphs), bullets (array of 4-7 strings), tags (array of 5-10 strings), seoTitle (max 60 chars), seoDescription (max 155 chars). Product title: ${title}\nBrand: ${brand}\nFacts and notes: ${brief}`;
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile", temperature: 0.25, response_format: { type: "json_object" }, messages: [{ role: "system", content: "You are a careful ecommerce catalog editor. Never fabricate product facts. Output valid JSON only." }, { role: "user", content: prompt }] }),
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("Groq error", response.status, detail.slice(0, 500));
      throw new Error(`Groq request failed (${response.status}). Check the API key and model access.`);
    }
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Groq returned an empty response.");
    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Admin AI error", error);
    return NextResponse.json({ error: error.message || "AI generation failed." }, { status: 400 });
  }
}
