import './globals.css';

export const metadata = {
  title: 'Road2Work — Latihan Interview Kerja dengan AI',
  description:
    'Platform berbasis AI yang membantu job seeker di Indonesia mempersiapkan interview kerja secara terarah, terukur, dan realistis. Ngobrol langsung dengan AI interviewer.',
  openGraph: {
    title: 'Road2Work — Latihan Interview Kerja dengan AI',
    description: 'Latihan interview terarah, terukur, dan realistis. Ngobrol langsung dengan AI interviewer.',
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
      <body>{children}</body>
    </html>
  );
}
