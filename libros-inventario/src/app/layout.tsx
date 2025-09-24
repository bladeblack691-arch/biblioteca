import './globals.css';

export const metadata = {
  title: 'Inventario de Libros',
  description: 'Sistema de gestión de biblioteca con Oracle XE',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
