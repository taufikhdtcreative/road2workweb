import Nav from './Nav';
import Footer from './Footer';

export default function LegalPage({ title, updated, children }) {
  return (
    <>
      <Nav />
      <main className="legal">
        <div className="wrap legal-wrap">
          <p className="kicker">Legal</p>
          <h1>{title}</h1>
          <p className="legal-meta">Terakhir diperbarui: {updated}</p>
          <p className="draft-note">
            Dokumen ini masih draf teknis yang menjelaskan cara kerja aplikasi saat ini. Tinjau dan sesuaikan bersama tim atau
            konsultan hukum (termasuk kepatuhan UU Pelindungan Data Pribadi) sebelum diluncurkan ke publik.
          </p>
          <div className="legal-body">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
