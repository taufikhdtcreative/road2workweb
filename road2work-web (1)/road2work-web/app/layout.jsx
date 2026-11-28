import './globals.css';
import './app.css';
import AuthProvider from '../components/AuthProvider';

export const metadata = {
  title: 'Road2Work — Latihan Interview Kerja dengan AI',
  description:
    'Platform kesiapan karier berbasis AI untuk job seeker Indonesia: baca profil, temukan role yang relevan, latih jawaban interview dengan suara, dan pahami langkah perbaikan berikutnya.',
  openGraph: {
    title: 'Road2Work — Latihan Interview Kerja dengan AI',
    description: 'Dari profil mentah ke latihan yang punya arah. Terarah, terukur, dan realistis.',
    type: 'website',
    locale: 'id_ID',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B0B0F',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
