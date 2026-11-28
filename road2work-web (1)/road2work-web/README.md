# Road2Work — Website, Login, dan Latihan Interview Suara dengan AI

Website Next.js bergaya Gen Z (tegas, elegan, beranimasi), responsif untuk HP dan laptop.

**Alur pengguna:** Daftar/Masuk → **Profile** (unggah CV atau tulis profil, AI membaca) → **Role** (rekomendasi role atau target sendiri) → **Practice** (interview suara dengan AI "Raka") → **Improve** (skor, kekuatan, hal yang perlu diperbaiki, riwayat dan grafik perkembangan).

Halaman publik: beranda (Fitur, Cara Kerja, FAQ), `/masuk`, `/syarat`, `/privasi`. Dashboard ada di `/dashboard` dan hanya bisa dibuka setelah login. Tidak ada section Team.

## Menjalankan di komputer

Butuh Node.js 18.18 atau lebih baru.

```bash
npm install
cp .env.example .env.local      # isi ANTHROPIC_API_KEY di file .env.local
npm run dev                     # buka http://localhost:3000
```

Tanpa mengisi Supabase, situs berjalan dalam **mode demo** (lihat bagian berikut). Cukup untuk mencoba semua fitur di komputer sendiri.

## Dua mode login (penting dibaca sebelum deploy)

| | Mode demo (default) | Mode Supabase (untuk produksi) |
|---|---|---|
| Syarat | tidak ada | akun Supabase gratis + 2 variabel env |
| Akun | tersimpan di browser saja | tersimpan di server Supabase |
| Data (profil, riwayat) | hanya di browser itu | tersinkron antar HP dan laptop |
| Perlindungan API AI | **tidak ada** | wajib login, token diverifikasi server |

**Mode demo hanya untuk mencoba.** Login di mode ini berjalan sepenuhnya di browser, jadi tidak melindungi apa pun: siapa saja yang tahu alamat situsmu bisa memanggil API AI memakai `ANTHROPIC_API_KEY` milikmu. Satu-satunya pembatas adalah rate limit sederhana per IP. **Jangan buka situs ke publik tanpa mengaktifkan Supabase**, dan pasang batas pengeluaran bulanan di dashboard Anthropic.

## Mengaktifkan login sungguhan (Supabase)

1. Buat project gratis di supabase.com.
2. Buka **SQL Editor**, jalankan SQL berikut (membuat tabel data pengguna, dengan aturan agar tiap orang hanya bisa mengakses datanya sendiri):

```sql
create table if not exists public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

create policy "baca data sendiri" on public.user_data
  for select using (auth.uid() = user_id);
create policy "tambah data sendiri" on public.user_data
  for insert with check (auth.uid() = user_id);
create policy "ubah data sendiri" on public.user_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "hapus data sendiri" on public.user_data
  for delete using (auth.uid() = user_id);
```

3. Buka **Project Settings → API**. Salin **Project URL** dan **anon public key**, lalu isi di `.env.local` (dan di Vercel):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

   Kunci `anon` memang dirancang publik. Keamanannya dijaga oleh aturan RLS di SQL tadi, jadi jangan lewati langkah 2. Jangan pernah memakai kunci `service_role` di sini.

4. Buka **Authentication → URL Configuration**. Isi **Site URL** dengan alamat situsmu (misalnya `https://road2work.id`) dan tambahkan **Redirect URLs**:
   - `https://road2work.id/dashboard`
   - `http://localhost:3000/dashboard`
   - alamat `.vercel.app` milikmu, kalau dipakai
5. Secara bawaan Supabase meminta konfirmasi email saat daftar. Aplikasi sudah menanganinya (menampilkan "cek email kamu"). Untuk uji coba cepat, boleh dimatikan di **Authentication → Providers → Email**.
6. **Opsional, Masuk dengan Google:** aktifkan provider Google di Supabase, lalu set `NEXT_PUBLIC_GOOGLE_LOGIN=true`.

Variabel yang diawali `NEXT_PUBLIC_` dibaca saat **build**. Setelah mengubahnya di Vercel, lakukan **Redeploy**.

> Catatan: jalur Supabase ini sudah dites sampai tingkat kode dan build, tetapi belum dicoba dengan project Supabase sungguhan. Setelah memasangnya, coba daftar, keluar, lalu masuk dari perangkat lain untuk memastikan data ikut berpindah.

## Deploy ke Vercel

1. Upload isi folder ini ke GitHub, lalu import repo-nya di vercel.com.
2. Di **Settings → Environment Variables**, isi:
   - `ANTHROPIC_API_KEY` (wajib)
   - `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` (wajib untuk publik)
   - `ANTHROPIC_MODEL` (opsional, default `claude-sonnet-5-5`)
   - `NEXT_PUBLIC_GOOGLE_LOGIN` (opsional)
3. Klik Deploy. Pasang domain `road2work.id` lewat **Settings → Domains**.

API key Anthropic hanya dipakai di server (`app/api/*`) dan tidak dikirim ke browser.

## Fitur suara

- **Bicara:** tombol mikrofon memakai Web Speech API (bahasa Indonesia). Jawaban terkirim otomatis saat selesai bicara.
- **Dengar:** balasan AI dibacakan lewat speech synthesis browser. Bisa dimatikan lewat toggle "Suara AI".
- **Mode ngobrol otomatis:** setelah AI selesai bicara, mikrofon menyala lagi.
- Hanya berfungsi di **HTTPS atau localhost**, dan butuh izin mikrofon.
- Terbaik di Chrome, Edge, dan Safari terbaru. Firefox belum mendukung pengenalan suara, jadi pengguna tetap bisa mengetik.
- Di Chrome, audio diproses server Google untuk diubah menjadi teks. Hanya teksnya yang dikirim ke AI. Tidak ada rekaman audio yang disimpan.
- Kualitas suara AI bergantung suara bahasa Indonesia di perangkat. Untuk suara lebih natural, sambungkan layanan text-to-speech khusus.

## Struktur

```
app/
  layout.jsx, page.jsx      beranda (Fitur, Cara Kerja, FAQ, CTA)
  masuk/                    halaman daftar dan masuk
  dashboard/                Profile, Role, Practice, Improve
  syarat/, privasi/         halaman legal (masih draf)
  api/chat/route.js         percakapan interview + penilaian akhir
  api/profile/route.js      analisis CV/profil dan rekomendasi role
  globals.css, app.css      gaya dan animasi
components/
  AuthProvider.jsx          login (Supabase atau mode demo)
  useUserData.js            simpan data pengguna (browser + sinkron Supabase)
  Interviewer.jsx           chat, mikrofon, suara AI
  Workflow.jsx, Footer.jsx, Nav.jsx, Reveal.jsx, FeedbackCard.jsx
  dashboard/                langkah-langkah dashboard
lib/
  server.js                 verifikasi login, rate limit, pemanggilan Anthropic
  supabase.js, store.js
```

## Mengubah isi

- **Teks beranda, fitur, FAQ:** `app/page.jsx`.
- **Warna dan font:** variabel di atas `app/globals.css` (`--lime`, `--lav`, `--display`, dst).
- **Daftar posisi di mode bebas:** array `ROLES` di `components/Interviewer.jsx`.
- **Kepribadian dan penilaian AI:** `systemPrompt` di `app/api/chat/route.js`, dan `SYSTEM` di `app/api/profile/route.js`.

## Catatan

- Rate limit di `lib/server.js` bersifat in-memory per instance. Di Vercel (serverless) batasnya tidak dibagi antar instance, jadi untuk trafik nyata pakai Upstash Redis atau sejenisnya.
- Skor dari AI adalah perkiraan untuk arah latihan, bukan penilaian resmi. Teks ini juga tertulis di aplikasi.
- Halaman `/syarat` dan `/privasi` adalah draf teknis yang menjelaskan cara kerja aplikasi. Tinjau bersama tim atau konsultan hukum (termasuk UU Pelindungan Data Pribadi) sebelum diluncurkan.
- Teks, klaim fitur, dan angka contoh di beranda adalah draf. Sesuaikan dengan konten Road2Work yang sebenarnya.
- `next` memakai 15.5.12 karena 15.1.6 punya kerentanan keamanan yang sudah ditambal.
