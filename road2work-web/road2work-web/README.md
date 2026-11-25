# Road2Work — Website + AI Interviewer (suara & teks)

Website landing page bergaya Gen Z (tegas, elegan, beranimasi) dengan fitur **ngobrol langsung dengan AI interviewer "Raka"**, bisa pakai suara maupun ketikan. Responsif untuk HP dan laptop. Tidak ada section Team.

## Menjalankan di komputer

Butuh Node.js 18.18 atau lebih baru.

```bash
npm install
cp .env.example .env.local      # lalu isi ANTHROPIC_API_KEY di file .env.local
npm run dev                     # buka http://localhost:3000
```

Untuk mode produksi:

```bash
npm run build
npm start
```

## Deploy ke Vercel

1. Upload folder ini ke GitHub, lalu import repo-nya di vercel.com.
2. Di **Settings → Environment Variables**, tambahkan `ANTHROPIC_API_KEY` (opsional `ANTHROPIC_MODEL`).
3. Klik Deploy. Pakai domain `road2work.id` lewat **Settings → Domains**.

API key hanya dipakai di server (`app/api/chat/route.js`) dan tidak pernah dikirim ke browser.

## Fitur suara

- **Bicara:** tombol mikrofon memakai Web Speech API (bahasa Indonesia). Jawabanmu terkirim otomatis saat kamu selesai bicara.
- **Dengar:** balasan AI dibacakan lewat speech synthesis browser. Bisa dimatikan lewat toggle "Suara AI".
- **Mode ngobrol otomatis:** setelah AI selesai bicara, mikrofon langsung menyala lagi, jadi terasa seperti percakapan sungguhan.
- Suara hanya berfungsi di **HTTPS atau localhost**, dan butuh izin mikrofon dari browser.
- Dukungan terbaik: Chrome, Edge, dan Safari terbaru. Firefox belum mendukung pengenalan suara, jadi pengguna tetap bisa mengetik.
- Catatan privasi: di Chrome, pengenalan suara diproses server Google. Teks jawaban dikirim ke Anthropic API untuk dibalas AI.
- Kualitas suara AI tergantung suara bahasa Indonesia yang terpasang di perangkat. Kalau mau suara yang lebih natural, sambungkan layanan text-to-speech khusus.

## Struktur

```
app/
  layout.jsx            metadata, font, viewport
  page.jsx              seluruh section halaman
  globals.css           semua gaya dan animasi
  api/chat/route.js     endpoint AI (prompt interviewer, validasi, rate limit)
components/
  Nav.jsx               navbar + menu HP
  Interviewer.jsx       chat, mikrofon, suara AI
  Reveal.jsx            animasi muncul saat scroll
```

## Mengubah isi

- **Teks dan section:** edit `app/page.jsx`.
- **Warna dan font:** variabel di bagian atas `app/globals.css` (`--lime`, `--lav`, `--display`, dst).
- **Daftar posisi:** array `ROLES` di `components/Interviewer.jsx`.
- **Kepribadian dan aturan AI:** fungsi `systemPrompt` di `app/api/chat/route.js`.
- **Model AI:** variabel `ANTHROPIC_MODEL` (default `claude-sonnet-5-5`).

## Catatan

- Rate limit di `route.js` bersifat in-memory (20 permintaan per menit per IP). Di Vercel (serverless) batas ini tidak dibagi antar instance, jadi untuk trafik nyata pakai Upstash Redis atau sejenisnya, dan pasang batas pengeluaran di dashboard Anthropic.
- Teks, fitur, dan klaim di halaman ini adalah draf, karena isi website asli tidak bisa dibaca saat dibuat. Sesuaikan dengan konten Road2Work yang sebenarnya.
- `next` dinaikkan ke 15.5.12 karena 15.1.6 punya kerentanan keamanan yang sudah ditambal.
