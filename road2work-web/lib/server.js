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
    const res = await fetch(`${url.replace(/\/$/, '')}/auth/v1/user`, {
      headers: { apikey: anon, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { ok: false };
    const user = await res.json();
    return user?.id ? { ok: true, id: user.id } : { ok: false };
  } catch {
    return { ok: false };
  }
}

const GEMINI_MODEL = 'gemini-2.5-flash';

export async function callClaude({ system, messages, maxTokens = 300 }) {
  const key = getApiKey();
  if (!key) return { ok: false, error: 'GEMINI_API_KEY belum diisi.' };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': key,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          generationConfig: {
            maxOutputTokens: maxTokens,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('Gemini error:', res.status, data);
      if (res.status === 429) {
        return { ok: false, error: 'Kuota AI gratis sedang penuh. Coba lagi sebentar.' };
      }
      return { ok: false, error: data?.error?.message || 'AI sedang bermasalah.' };
    }

    const text = (data.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || '')
      .join('')
      .trim();

    if (!text) return { ok: false, error: 'AI tidak memberi jawaban. Coba lagi.' };
    return { ok: true, text };
  } catch (e) {
    console.error('Gemini fetch gagal:', e);
    return { ok: false, error: 'Tidak bisa terhubung ke AI.' };
  }
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
