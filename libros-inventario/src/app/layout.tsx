export const metadata = {
  title: 'Inventario de Libros',
  description: 'Sistema de gestión de biblioteca con Oracle XE',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <main style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
