import './globals.css';

export const metadata = {
  title: 'Air2Ground Resilient',
  description:
    'Resilience starts where you stand. A clear, personal path to becoming more capable — built around your real life, your real space, your real constraints.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Newsreader:ital,opsz@0,6..72;1,6..72&family=Spline+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/a2g-espresso.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
