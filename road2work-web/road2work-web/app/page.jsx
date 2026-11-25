import Nav from '../components/Nav';
import Reveal from '../components/Reveal';
import Interviewer from '../components/Interviewer';

const STEPS = [
  ['01', 'Pilih posisi', 'Tentukan posisi yang kamu incar. Pertanyaan menyesuaikan peran dan levelmu.'],
  ['02', 'Ngobrol sungguhan', 'Jawab pakai suara atau ketikan. Alurnya realistis, lengkap dengan pertanyaan lanjutan.'],
  ['03', 'Dapat penilaian', 'Skor, kekuatan, dan hal yang perlu diperbaiki. Ulangi sampai kamu siap.'],
];

const MARQUEE = ['Terarah', 'Terukur', 'Realistis'];

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="glow g1" aria-hidden="true" />
          <div className="glow g2" aria-hidden="true" />
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="pulse" /> Platform interview berbasis AI untuk job seeker Indonesia
              </p>
              <h1>
                Interview itu
                <br />
                bukan buat
                <br />
                <span className="serif it lime">ditakuti.</span>
              </h1>
              <p className="lead">
                Latihan interview yang terarah, terukur, dan realistis. Ngobrol langsung dengan AI interviewer, dapat
                umpan balik instan, lalu tampil percaya diri di hari-H.
              </p>
              <div className="cta-row">
                <a className="btn btn-lime btn-lg" href="#ngobrol">
                  Ngobrol dengan AI
                  <span aria-hidden="true">→</span>
                </a>
                <a className="btn btn-outline btn-lg" href="#cara-kerja">
                  Lihat cara kerja
                </a>
              </div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="phone">
                <div className="phone-orb">
                  <span className="ring r1" />
                  <span className="ring r2" />
                  <span className="core" />
                </div>
                <div className="mini-bubble ai">Ceritakan pengalamanmu menghadapi tekanan kerja.</div>
                <div className="mini-bubble me">Waktu proyek kampus mepet deadline, saya…</div>
                <div className="mini-wave">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <i key={i} style={{ animationDelay: `${i * 0.07}s` }} />
                  ))}
                </div>
              </div>
              <span className="sticker s1">Terarah ✦</span>
              <span className="sticker s2">Terukur ✦</span>
              <span className="sticker s3">Realistis ✦</span>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="marquee-clip" aria-hidden="true">
         <div className="marquee">
          <div className="marquee-track">
            {Array.from({ length: 4 }).map((_, k) => (
              <div key={k} className="marquee-group">
                {MARQUEE.map((w) => (
                  <span key={w + k}>
                    {w} <em>✦</em>
                  </span>
                ))}
              </div>
            ))}
          </div>
         </div>
        </div>

        {/* CARA KERJA */}
        <section id="cara-kerja" className="section">
          <div className="wrap">
            <Reveal>
              <p className="kicker">Cara kerja</p>
              <h2>
                Tiga langkah, <span className="serif it lime">nol drama.</span>
              </h2>
            </Reveal>
            <div className="steps">
              {STEPS.map(([n, t, d], i) => (
                <Reveal key={n} className="step" delay={i * 90}>
                  <span className="num">{n}</span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* NGOBROL */}
        <section id="ngobrol" className="section talk">
          <div className="wrap">
            <Reveal>
              <p className="kicker">Coba sekarang</p>
              <h2>
                Ngobrol sama <span className="serif it lime">Raka.</span>
              </h2>
              <p className="lead sm">
                AI interviewer yang bertanya, mendengarkan, dan menjawab dengan suara. Aktifkan mic atau ketik, terserah kamu.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <Interviewer />
            </Reveal>
          </div>
        </section>

        {/* FITUR */}
        <section id="fitur" className="section">
          <div className="wrap">
            <Reveal>
              <p className="kicker">Fitur</p>
              <h2>
                Semua buat kamu <span className="serif it lime">tampil terbaik.</span>
              </h2>
            </Reveal>
            <div className="bento">
              <Reveal className="card b-lg lime-card">
                <span className="tag">Realistis</span>
                <h3>Simulasi yang terasa seperti interview beneran</h3>
                <p>Pertanyaan lanjutan menyesuaikan jawabanmu, bukan daftar pertanyaan kaku.</p>
              </Reveal>
              <Reveal className="card" delay={80}>
                <span className="tag">Terukur</span>
                <h3>Skor &amp; catatan</h3>
                <p>Penilaian akhir berisi kekuatan dan hal yang perlu dibenahi.</p>
              </Reveal>
              <Reveal className="card" delay={120}>
                <span className="tag">Terarah</span>
                <h3>Sesuai posisi</h3>
                <p>Pilih posisi atau ketik sendiri. Pertanyaan mengikuti peranmu.</p>
              </Reveal>
              <Reveal className="card b-lg lav-card" delay={160}>
                <span className="tag">Bicara</span>
                <h3>Jawab pakai suara</h3>
                <p>Latihan menjawab lisan, karena di interview asli kamu juga bicara, bukan mengetik.</p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section cta-sec">
          <div className="wrap">
            <Reveal className="cta-card">
              <h2>
                Latihan hari ini,
                <br />
                <span className="serif it">lebih siap besok.</span>
              </h2>
              <a className="btn btn-dark btn-lg" href="#ngobrol">
                Mulai ngobrol sekarang <span aria-hidden="true">→</span>
              </a>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap foot">
          <div>
            <a className="logo" href="#top">
              <span className="logo-dot" aria-hidden="true" />
              Road2Work
            </a>
            <p>Persiapan interview kerja berbasis AI untuk job seeker Indonesia.</p>
          </div>
          <nav aria-label="Footer">
            <a href="#cara-kerja">Cara Kerja</a>
            <a href="#ngobrol">Ngobrol dengan AI</a>
            <a href="#fitur">Fitur</a>
          </nav>
        </div>
        <p className="copy">© {new Date().getFullYear()} Road2Work. Seluruh hak cipta dilindungi.</p>
      </footer>
    </>
  );
}
