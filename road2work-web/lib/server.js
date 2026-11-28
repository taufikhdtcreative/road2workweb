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
  return (process.env.ANTHROPIC_API_KEY || '').trim().replace(/^["']|["']$/g, '');
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

export async function callClaude({ system, messages, maxTokens }) {
  try {
    const base = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '');
    const res = await fetch(`${base}/v1/messages`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': getApiKey(),
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
        max_tokens: maxTokens,
        system,
        messages,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error =
        res.status === 401
          ? 'API key Anthropic tidak valid.'
          : res.status === 429
          ? 'Kuota atau batas permintaan API tercapai. Coba lagi sebentar.'
          : data?.error?.message || `Layanan AI error (${res.status}).`;
      return { ok: false, error };
    }
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    if (!text) return { ok: false, error: 'AI tidak memberi jawaban. Coba lagi.' };
    return { ok: true, text };
  } catch {
    return { ok: false, error: 'Tidak bisa menghubungi layanan AI. Cek koneksi internet server.' };
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
