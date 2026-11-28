import LegalPage from '../../components/LegalPage';

export const metadata = { title: 'Kebijakan Privasi — Road2Work' };

export default function Privasi() {
  return (
    <LegalPage title="Kebijakan Privasi" updated="27 November 2026">
      <h2>1. Data yang kami proses</h2>
      <ul>
        <li>Data akun: nama dan alamat email yang kamu daftarkan.</li>
        <li>
          Hasil analisis profil: ringkasan cerita profesional, skor, rekomendasi role, dan target role yang kamu pilih.
        </li>
        <li>Hasil sesi latihan: skor, umpan balik, dan tanggal sesi.</li>
        <li>
          Teks atau file CV yang kamu kirim dan jawaban yang kamu ucapkan atau ketik diproses untuk menghasilkan analisis,
          tetapi tidak disimpan sebagai arsip. Isi percakapan latihan tidak disimpan.
        </li>
      </ul>

      <h2>2. Suara</h2>
      <p>
        Road2Work tidak menyimpan rekaman audio. Pengenalan suara dijalankan oleh browser-mu. Di Chrome, audio dikirim ke layanan
        Google untuk diubah menjadi teks. Teks hasil pengenalan itulah yang dikirim ke layanan AI kami.
      </p>

      <h2>3. Pihak ketiga yang terlibat</h2>
      <ul>
        <li>Anthropic: memproses teks untuk analisis profil dan percakapan latihan.</li>
        <li>Supabase: autentikasi dan penyimpanan data akun (jika diaktifkan pada layanan ini).</li>
        <li>Penyedia hosting: menjalankan situs dan API.</li>
        <li>Browser dan sistem operasimu: pengenalan suara dan suara AI.</li>
      </ul>

      <h2>4. Penyimpanan dan penghapusan</h2>
      <p>
        Data profil dan riwayat latihan terikat pada akunmu dan hanya dapat diakses oleh akunmu. Kamu bisa menghapus profil, target
        role, dan seluruh riwayat kapan saja lewat tombol “Hapus semua datamu” di dashboard. Untuk menghapus akun sepenuhnya, kirim
        permintaan ke hello@road2work.id.
      </p>

      <h2>5. Keamanan</h2>
      <p>
        Koneksi menggunakan HTTPS dan kunci layanan AI hanya berada di server. Tidak ada sistem yang sepenuhnya bebas risiko, jadi
        hindari mencantumkan data sensitif (misalnya nomor KTP atau alamat lengkap) pada CV atau jawabanmu.
      </p>

      <h2>6. Kontak</h2>
      <p>
        Pertanyaan tentang privasi: <a href="mailto:hello@road2work.id">hello@road2work.id</a>.
      </p>
    </LegalPage>
  );
}
