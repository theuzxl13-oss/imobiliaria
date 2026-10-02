/**
 * Proxy do assistente virtual (Cloudflare Worker, plano gratuito).
 * Guarda a chave do Gemini no servidor: o site chama este endereço e a chave nunca chega ao navegador.
 *
 * Variáveis do Worker (Settings → Variables and Secrets):
 *   GEMINI_API_KEY   (Secret) chave criada em https://aistudio.google.com/apikey
 *   ALLOWED_ORIGINS  (Text, opcional) sites autorizados, separados por vírgula.
 *                    Padrão: https://theuzxl13-oss.github.io
 */
const MODELS = ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.8-flash", "gemini-2.5-flash"];

const worker = {
  async fetch(request, env) {
    const allowed = (env.ALLOWED_ORIGINS || "https://theuzxl13-oss.github.io").split(",").map((s) => s.trim());
    const origin = request.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST" || !allowed.includes(origin)) return new Response("Forbidden", { status: 403, headers: cors });

    const raw = await request.text();
    if (raw.length > 100000) return new Response("Payload too large", { status: 413, headers: cors });
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return new Response("Bad request", { status: 400, headers: cors });
    }

    const model = MODELS.includes(body.model) ? body.model : MODELS[0];
    const payload = {
      systemInstruction: body.systemInstruction,
      contents: Array.isArray(body.contents) ? body.contents.slice(-24) : [],
      generationConfig: { temperature: 0.5, maxOutputTokens: 2048 },
    };
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify(payload),
    });
    return new Response(res.body, { status: res.status, headers: { ...cors, "Content-Type": "application/json" } });
  },
};

export default worker;
