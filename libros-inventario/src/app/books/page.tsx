async function fetchBooks(q: string) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/books${q ? `?q=${encodeURIComponent(q)}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return [] as any[];
  return res.json();
}

export default async function BooksPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams?.q ?? '';
  const books = await fetchBooks(q);
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Libros</h1>
        <a href="/books/new" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Agregar</a>
      </div>
      <form action="/books" method="get" className="mb-4 flex gap-2">
        <input className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200" name="q" placeholder="Buscar por título o autor" defaultValue={q} />
        <button type="submit" className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-100">Buscar</button>
      </form>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Autor</th>
              <th className="px-4 py-3">Año</th>
              <th className="px-4 py-3">Género</th>
              <th className="px-4 py-3">Copias</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b: any, idx: number) => (
              <tr key={b.ID ?? b.id} className={idx % 2 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3">{b.ID ?? b.id}</td>
                <td className="px-4 py-3">{b.TITULO ?? b.titulo}</td>
                <td className="px-4 py-3">{b.AUTOR ?? b.autor}</td>
                <td className="px-4 py-3">{b.ANIO_PUBLICACION ?? b.anio_publicacion}</td>
                <td className="px-4 py-3">{b.GENERO ?? b.genero}</td>
                <td className="px-4 py-3">{b.NUM_COPIAS ?? b.num_copias}</td>
                <td className="px-4 py-3">
                  <a className="text-blue-600 hover:underline" href={`/books/${b.ID ?? b.id}/edit`}>Editar</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
