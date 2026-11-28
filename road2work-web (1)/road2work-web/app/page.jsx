import Link from 'next/link';
import Nav from '../components/Nav';
import Reveal from '../components/Reveal';
import Workflow from '../components/Workflow';
import Footer from '../components/Footer';

const MARQUEE = ['Terarah', 'Terukur', 'Realistis'];

const FAQ = [
  [
    'Data apa saja yang disimpan?',
    'Email dan nama akunmu, hasil analisis profil (ringkasan, skor, rekomendasi role), target role, dan ringkasan hasil tiap sesi latihan. Teks atau file CV diproses untuk dianalisis, tetapi tidak disimpan. Isi percakapan latihan juga tidak disimpan. Kamu bisa menghapus semua datamu kapan saja dari dashboard.',
  ],
  [
    'Apakah suaraku direkam?',
    'Road2Work tidak menyimpan rekaman audio. Pengenalan suara dijalankan oleh browser-mu. Di Chrome, audio dikirim ke layanan Google untuk diubah menjadi teks. Yang kami teruskan ke AI hanyalah teks jawabanmu.',
  ],
  [
    'Seberapa akurat skornya?',
    'Skor adalah perkiraan AI berdasarkan jawabanmu, dipakai untuk menunjukkan arah latihan. Skor ini bukan penilaian resmi dan tidak menjamin hasil interview sungguhan.',
  ],
  [
    'Format CV apa yang bisa diunggah?',
    'PDF atau TXT dengan ukuran maksimal 3 MB. Kamu juga bisa menempel teks CV atau menulis profil singkat langsung.',
  ],
  [
    'Browser apa yang mendukung interview suara?',
    'Chrome, Edge, dan Safari versi terbaru. Fitur suara butuh koneksi aman (HTTPS) dan izin mikrofon. Di browser yang belum mendukung, kamu tetap bisa berlatih dengan mengetik jawaban.',
  ],
];

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
                <span className="pulse" /> Platform kesiapan karier berbasis AI untuk job seeker Indonesia
              </p>
              <h1>
                Interview itu
                <br />
                bukan buat
                <br />
                <span className="serif it lime">ditakuti.</span>
              </h1>
              <p className="lead">
                Baca profilmu, temukan role yang relevan, lalu latihan interview dengan suara bersama AI. Terarah, terukur,
                dan realistis, dengan feedback di setiap sesi.
              </p>
              <div className="cta-row">
                <Link className="btn btn-lime btn-lg" href="/masuk?daftar=1">
                  Mulai Bangun Profil
                  <span aria-hidden="true">→</span>
                </Link>
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

        {/* FITUR */}
        <section id="fitur" className="section">
          <div className="wrap">
            <Reveal>
              <p className="kicker">Fitur</p>
              <h2>
                Dari CV ke jawaban yang <span className="serif it lime">meyakinkan.</span>
              </h2>
            </Reveal>

            <div className="pillars">
              <Reveal className="pillar">
                <h3>Rapikan Cerita Profesionalmu</h3>
                <p>
                  Ubah CV, project, organisasi, atau pengalaman magang menjadi cerita singkat yang jelas, relevan, dan siap
                  dibawa ke interview.
                </p>
                <div className="mock">
                  <div className="mock-head">
                    <span className="mono">CERITA PROFIL</span>
                    <em>01</em>
                  </div>
                  <div className="mock-rows">
                    {[
                      ['Fokus karier jelas', '8/10'],
                      ['Pengalaman relevan', '7/10'],
                      ['Bukti siap diceritakan', '6/10'],
                    ].map(([l, v]) => (
                      <div className="mock-row" key={l}>
                        <span>{l}</span>
                        <b>{v}</b>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal className="pillar" delay={100}>
                <h3>Tentukan Arah Role yang Masuk Akal</h3>
                <p>
                  Pahami role mana yang paling realistis untuk dilatih berdasarkan pengalamanmu, bukan sekadar memilih role yang
                  terdengar populer.
                </p>
                <div className="mock">
                  {[
                    ['Role paling relevan', '86% siap', 86],
                    ['Gap utama terlihat', '3 fokus', 60],
                    ['Arah latihan jelas', 'Next step', 52],
                  ].map(([l, badge, w]) => (
                    <div className="mock-card" key={l}>
                      <div className="mock-line">
                        <span>{l}</span>
                        <em>{badge}</em>
                      </div>
                      <div className="bar-track" role="presentation">
                        <i style={{ width: `${w}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal className="pillar" delay={200}>
                <h3>Latih Jawaban sampai Lebih Terukur</h3>
                <p>
                  Biasakan menjawab dengan konteks, kontribusi, dan hasil yang jelas agar latihan berikutnya punya fokus
                  perbaikan yang konkret.
                </p>
                <div className="fbcard mockfb">
                  <div className="fb-hero">
                    <span className="mono">JAWABAN LEBIH TERUKUR</span>
                    <b>72%</b>
                  </div>
                  <div className="fb-body">
                    {[
                      ['Konteks pengalaman', 58],
                      ['Kontribusi pribadi', 64],
                      ['Hasil terukur', 78],
                    ].map(([l, v]) => (
                      <div className="bar-row" key={l}>
                        <div className="bar-head">
                          <span>{l}</span>
                          <b>{v}</b>
                        </div>
                        <div className="bar-track" role="presentation">
                          <i style={{ width: `${v}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
            <p className="sample-note">Contoh tampilan. Angka di atas hanya ilustrasi.</p>
          </div>
        </section>

        {/* CARA KERJA */}
        <section id="cara-kerja" className="section wf-sec">
          <div className="wrap">
            <Reveal>
              <Workflow />
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section">
          <div className="wrap faq-wrap">
            <Reveal>
              <p className="kicker">FAQ</p>
              <h2>
                Pertanyaan <span className="serif it lime">yang sering muncul.</span>
              </h2>
            </Reveal>
            <Reveal className="faq" delay={80}>
              {FAQ.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </Reveal>
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
              <Link className="btn btn-dark btn-lg" href="/masuk?daftar=1">
                Mulai Bangun Profil <span aria-hidden="true">→</span>
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
