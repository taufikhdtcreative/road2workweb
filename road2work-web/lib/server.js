// Helper khusus server: autentikasi, rate limit, dan pemanggilan Anthropic API.

const WINDOW_MS = 60_000;
const buckets = new Map();

// Rate limit sederhana (in-memory). Di serverless, pakai Upstash/Redis untuk hasil yang lebih ketat.
export function rateLimited(key, max = 20) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) buckets.clear();
  return hits.length > max;
}

export function clientIp(request) {
  return (request.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
}

export function getApiKey() {
  return (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
}

export function keyMissing(key) {
  return !key || key.startsWith('isi_api_key');
}

// Jika Supabase dikonfigurasi, token login wajib valid. Jika tidak (mode demo), lolos tanpa token.
export async function authenticate(request) {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
  if (!url || !anon) return { ok: true, id: null };

  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return { ok: false };
  try {
    const res = await fetchWithRetry(`${url.replace(/\/$/, '')}/auth/v1/user`, {
      headers: { apikey: anon, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { ok: false };
    const user = await res.json();
    return user?.id ? { ok: true, id: user.id } : { ok: false };
  } catch {
    return { ok: false };
  }
}
function toParts(content) {
  if (typeof content === 'string') return [{ text: content }];
  if (!Array.isArray(content)) return [{ text: String(content ?? '') }];

  const parts = [];
  for (const b of content) {
    if (typeof b === 'string') {
      parts.push({ text: b });
    } else if (b?.type === 'text') {
      parts.push({ text: String(b.text ?? '') });
    } else if ((b?.type === 'document' || b?.type === 'image') && b.source?.type === 'base64') {
      parts.push({
        inline_data: { mime_type: b.source.media_type, data: b.source.data },
      });
    }
  }
  return parts.length ? parts : [{ text: '' }];
}

const GEMINI_MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];

async function geminiOnce(model, key, body, timeoutMs) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    }
  );
}

export async function callClaude({ system, messages, maxTokens = 300 }) {
  const key = getApiKey();
  if (!key) return { ok: false, error: 'GEMINI_API_KEY belum diisi.' };

  const body = {
    system_instruction: { parts: toParts(system) },
    contents: messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: toParts(m.content),
    })),
    generationConfig: { maxOutputTokens: maxTokens },
  };

  const deadline = Date.now() + 50000;
  let res = null;
  let data = {};

  for (const model of GEMINI_MODELS) {
    const remaining = deadline - Date.now();
    if (remaining < 4000) break;

    try {
      res = await geminiOnce(model, key, body, Math.min(20000, remaining));
      data = await res.json().catch(() => ({}));
    } catch (e) {
      console.error('Gemini timeout/gagal pada', model, e?.name);
      res = { ok: false, status: 504 };
      continue;
    }

    if (res.ok) break;
    console.error('Gemini error:', model, res.status, data);
    if (![404, 429, 503].includes(res.status)) break;
  }

  if (!res) return { ok: false, error: 'Tidak bisa terhubung ke AI.' };

  if (!res.ok) {
    if ([429, 503, 504].includes(res.status)) {
      return { ok: false, error: 'AI sedang ramai atau lambat. Coba lagi dalam beberapa menit.' };
    }
    return { ok: false, error: data?.error?.message || 'AI sedang bermasalah.' };
  }

  const text = (data.candidates?.[0]?.content?.parts || [])
    .map((p) => p.text || '')
    .join('')
    .trim();

  if (!text) return { ok: false, error: 'AI tidak memberi jawaban. Coba lagi.' };
  return { ok: true, text };
}

export function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

export const clampNum = (v, min, max) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : min;
};
export const cleanStr = (v, max = 400) => (typeof v === 'string' ? v.replace(/[*_#`]/g, '').trim().slice(0, max) : '');
export const cleanList = (v, n = 3, max = 220) => (Array.isArray(v) ? v.map((x) => cleanStr(x, max)).filter(Boolean).slice(0, n) : []);
