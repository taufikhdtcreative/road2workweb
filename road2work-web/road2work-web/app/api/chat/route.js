const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const buckets = new Map();

// Rate limit sederhana (in-memory). Di serverless, pakai Upstash/Redis untuk hasil yang lebih ketat.
function limited(ip) {
  const now = Date.now();
  const hits = (buckets.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  buckets.set(ip, hits);
  if (buckets.size > 5000) buckets.clear();
  return hits.length > MAX_PER_WINDOW;
}

function systemPrompt(role, mode) {
  const base = `Kamu adalah Raka, pewawancara kerja profesional di platform Road2Work. Kamu mensimulasikan interview kerja secara realistis untuk posisi: "${role}".

Aturan:
- Gunakan Bahasa Indonesia yang santai tapi profesional, seperti percakapan lisan.
- Ajukan SATU pertanyaan per giliran.
- Setiap giliran: satu kalimat komentar singkat yang spesifik atas jawaban sebelumnya, lalu satu pertanyaan lanjutan. Maksimal 3 kalimat.
- Jawabanmu akan dibacakan suara, jadi tanpa markdown, tanpa daftar, tanpa emoji, tanpa tanda bintang.
- Variasikan topik: perkenalan, motivasi, pengalaman (metode STAR), situasi sulit, kekuatan dan kelemahan, ekspektasi, pertanyaan untuk perusahaan.
- Setelah sekitar 5 sampai 6 pertanyaan, tawarkan kepada kandidat untuk mengakhiri sesi dan meminta penilaian.
- Jika kandidat keluar topik, arahkan kembali dengan sopan ke interview.
- Pesan pertama "Mulai interview." berarti: sapa singkat, perkenalkan dirimu, lalu ajukan pertanyaan pembuka.`;

  if (mode === 'final') {
    return `${base}

SESI SUDAH SELESAI. Berikan penilaian akhir dalam Bahasa Indonesia, tanpa markdown dan tanpa daftar bernomor. Baris pertama harus berformat "Skor: NN/100". Lalu sebutkan dua kekuatan, dua hal yang perlu diperbaiki, dan satu saran latihan berikutnya, semuanya berdasarkan jawaban kandidat yang benar-benar ada di percakapan. Maksimal 120 kata. Jangan ajukan pertanyaan baru.`;
  }
  return base;
}

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.startsWith('isi_api_key')) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY belum diisi. Salin .env.example menjadi .env.local lalu isi API key-nya.' },
      { status: 500 }
    );
  }

  const ip = (request.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
  if (limited(ip)) {
    return Response.json({ error: 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.' }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Format permintaan tidak valid.' }, { status: 400 });
  }

  const role = String(body.role || 'Fresh Graduate').replace(/[\r\n]+/g, ' ').slice(0, 60);
  const mode = body.mode === 'final' ? 'final' : 'chat';
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    .slice(-24);

  if (!messages.length || messages[0].role !== 'user') {
    return Response.json({ error: 'Percakapan tidak valid.' }, { status: 400 });
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
        max_tokens: mode === 'final' ? 600 : 300,
        system: systemPrompt(role, mode),
        messages,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        res.status === 401
          ? 'API key Anthropic tidak valid.'
          : res.status === 429
          ? 'Kuota atau batas permintaan API tercapai. Coba lagi sebentar.'
          : data?.error?.message || `Layanan AI error (${res.status}).`;
      return Response.json({ error: msg }, { status: 502 });
    }

    const reply = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    if (!reply) return Response.json({ error: 'AI tidak memberi jawaban. Coba lagi.' }, { status: 502 });
    return Response.json({ reply });
  } catch {
    return Response.json({ error: 'Tidak bisa menghubungi layanan AI. Cek koneksi internet server.' }, { status: 502 });
  }
}
