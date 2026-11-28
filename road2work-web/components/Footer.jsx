import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap foot-grid">
        <div className="foot-brand">
          <Link className="logo" href="/">
            <span className="logo-dot" aria-hidden="true" />
            Road2Work<span className="lime">.id</span>
          </Link>
          <p>
            Platform kesiapan karier untuk membaca profil, menemukan role yang relevan, melatih jawaban interview, dan
            memahami langkah perbaikan berikutnya.
          </p>
          <p className="foot-mail">
            <b>Email:</b> <a href="mailto:hello@road2work.id">hello@road2work.id</a>
          </p>
          <div className="capstone">
            <span className="mono">CAPSTONE PROJECT</span>
            <p>
              Dikembangkan oleh Tim <b>CC26-PSU050</b> untuk mendukung tema <i>Future-Ready Work &amp; Economy</i>.
            </p>
          </div>
        </div>

        <nav className="foot-col" aria-label="Platform">
          <h3>Platform</h3>
          <Link href="/">Produk</Link>
          <a href="/#cara-kerja">Cara Kerja</a>
          <a href="/#fitur">Fitur</a>
          <Link href="/dashboard">Demo</Link>
        </nav>

        <nav className="foot-col" aria-label="Legal dan bantuan">
          <h3>Legal &amp; Bantuan</h3>
          <a href="mailto:hello@road2work.id">Pusat Bantuan</a>
          <a href="/#faq">Tanya Jawab (FAQ)</a>
          <Link href="/syarat">Syarat &amp; Ketentuan</Link>
          <Link href="/privasi">Kebijakan Privasi</Link>
        </nav>

        <div className="foot-cta">
          <h3>Mulai dari Profil</h3>
          <p>Bangun profil latihan lebih dulu, lalu lanjut ke role fit dan interview berbasis suara.</p>
          <Link className="btn btn-lime btn-lg" href="/masuk?daftar=1">
            Mulai Bangun Profil
          </Link>
        </div>
      </div>
      <p className="copy">© {new Date().getFullYear()} Road2Work.id. Seluruh hak cipta dilindungi.</p>
    </footer>
  );
}
