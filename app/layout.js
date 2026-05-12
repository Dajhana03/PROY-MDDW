import './globals.css';

export const metadata = {
  title: 'ECO CANJE',
  description: 'Red solidaria sostenible para estudiantes y comunidades.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
