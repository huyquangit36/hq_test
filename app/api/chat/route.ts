import { NextResponse } from "next/server";
import { query } from "@/lib/db";

let cachedInventory = "";
let lastFetch = 0;

async function getInventory() {
  const now = Date.now();
  if (cachedInventory && (now - lastFetch < 600000)) return cachedInventory;
  
  try {
    const res = await query(`SELECT id, name, price, description FROM products LIMIT 10`);
    cachedInventory = res.rows.map(p => 
      `- ${p.name}: $${p.price} ([Secure Drop](/products/${p.id})). Context: ${p.description}`
    ).join("\n");
    lastFetch = now;
  } catch (e) {
    if (!cachedInventory) cachedInventory = "New hoodies and tees just dropped.";
  }
  return cachedInventory;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    const inventory = await getInventory();

    const contents = messages.slice(-6).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));
    if (contents.length > 0 && contents[0].role === "model") contents.shift();

    const systemPrompt = `You are the Head Sales Expert at HQ Streetwear. 
    YOUR DATABASE: ${inventory} 
    YOUR PERSONALITY: - You are a streetwear enthusiast. Cool, confident, and professional. 
    - You always try to help customers secure their next "drop". 
    YOUR MISSION: - If a user asks for "best sellers" or "recommendations", pick 2-3 hot items from the DATABASE above and hype them up. 
    - Never say "I don't have information about best sellers". Instead, suggest the best items you see in the list. 
    - Strictly refuse non-fashion questions (code, math, other brands). 
    - Always reply in the user's language. Keep it brief and stylish. Always provide product links in markdown.`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        system_instruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 350 }
      })
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: "AI_BUSY" }, { status: response.status });

    return NextResponse.json({ content: data.candidates[0].content.parts[0].text });
  } catch (error) {
    return NextResponse.json({ error: "SERVER_OFFLINE" }, { status: 500 });
  }
}