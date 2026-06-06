const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
export const PRIMARY_MODEL = 'openai/gpt-4o-mini';
export const FALLBACK_MODEL = 'google/gemini-2.0-flash-exp:free';
const TIMEOUT_MS = 25000;

let apiKey = '';

export function setOpenRouterKey(key: string) {
  apiKey = key;
  console.log('[OPENROUTER] API key set');
}

export async function chatCompletion(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  model = PRIMARY_MODEL,
): Promise<string> {
  if (!apiKey) {
    console.log('[OPENROUTER] fallback triggered — no API key');
    throw new Error('No API key');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
    console.log('[OPENROUTER] timeout —', TIMEOUT_MS, 'ms exceeded');
  }, TIMEOUT_MS);

  const start = Date.now();
  console.log('[OPENROUTER] request sent — model:', model);

  try {
    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://brandforge.app',
        'X-Title': 'BrandForge',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 900,
        temperature: 0.7,
      }),
    });

    clearTimeout(timer);
    const latency = Date.now() - start;
    console.log('[OPENROUTER] latency:', latency, 'ms');

    if (!res.ok) {
      const errText = await res.text();
      console.log('[OPENROUTER] HTTP', res.status, '—', errText.slice(0, 200));
      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 100)}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    console.log('[OPENROUTER] response received — model:', model, '— chars:', content.length);
    console.log('[OPENROUTER] raw (first 400):', content.slice(0, 400));
    return content;
  } catch (e: any) {
    clearTimeout(timer);
    if (e?.name === 'AbortError') {
      console.log('[OPENROUTER] timeout — fallback triggered');
      throw new Error('timeout');
    }
    console.log('[OPENROUTER] error:', e?.message ?? e);
    throw e;
  }
}
