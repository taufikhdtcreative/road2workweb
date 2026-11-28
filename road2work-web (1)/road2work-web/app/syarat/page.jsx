import LegalPage from '../../components/LegalPage';

export const metadata = { title: 'Syarat & Ketentuan — Road2Work' };

export default function Syarat() {
  return (
    <LegalPage title="Syarat & Ketentuan" updated="27 November 2026">
      <h2>1. Tentang layanan</h2>
      <p>
        Road2Work.id adalah platform latihan dan persiapan interview kerja berbasis AI. Layanan ini membantu membaca profil,
        memetakan role, dan melatih jawaban. Layanan ini bukan lembaga penempatan kerja dan tidak menjanjikan hasil rekrutmen.
      </p>

      <h2>2. Hasil dan skor dari AI</h2>
      <p>
        Analisis, rekomendasi role, dan skor dihasilkan oleh AI sebagai perkiraan untuk membantu arah latihan. Hasilnya dapat
        keliru dan bukan penilaian resmi dari perusahaan mana pun.
      </p>

      <h2>3. Akun dan penggunaan</h2>
      <ul>
        <li>Kamu bertanggung jawab atas kerahasiaan akun dan kata sandimu.</li>
        <li>Gunakan data milikmu sendiri dan jangan mengunggah data pribadi orang lain tanpa izin.</li>
        <li>Dilarang menyalahgunakan layanan, termasuk mengirim permintaan berlebihan atau mencoba menembus sistem.</li>
      </ul>

      <h2>4. Konten yang kamu kirim</h2>
      <p>
        Kamu tetap memiliki CV dan jawabanmu. Dengan menggunakannya di layanan ini, kamu mengizinkan kami memprosesnya untuk
        menghasilkan analisis sebagaimana dijelaskan di Kebijakan Privasi.
      </p>

      <h2>5. Ketersediaan dan perubahan</h2>
      <p>
        Layanan disediakan apa adanya dan dapat berubah atau terhenti sewaktu-waktu. Syarat ini dapat diperbarui, dan
        penggunaan yang berlanjut berarti kamu menyetujui versi terbaru.
      </p>

      <h2>6. Kontak</h2>
      <p>
        <a href="mailto:hello@road2work.id">hello@road2work.id</a>
      </p>
    </LegalPage>
  );
}
