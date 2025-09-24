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
      <h1>Libros</h1>
      <form action="/books" method="get" style={{ marginBottom: 12 }}>
        <input name="q" placeholder="Buscar por título o autor" defaultValue={q} />
        <button type="submit">Buscar</button>
        <a href="/books/new" style={{ marginLeft: 8 }}>Agregar</a>
      </form>
      <table border={1} cellPadding={6} cellSpacing={0}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Autor</th>
            <th>Año</th>
            <th>Género</th>
            <th>Copias</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b: any) => (
            <tr key={b.ID ?? b.id}>
              <td>{b.ID ?? b.id}</td>
              <td>{b.TITULO ?? b.titulo}</td>
              <td>{b.AUTOR ?? b.autor}</td>
              <td>{b.ANIO_PUBLICACION ?? b.anio_publicacion}</td>
              <td>{b.GENERO ?? b.genero}</td>
              <td>{b.NUM_COPIAS ?? b.num_copias}</td>
              <td>
                <a href={`/books/${b.ID ?? b.id}/edit`}>Editar</a>
                {' '}|{' '}
                <a href={`/api/books/${b.ID ?? b.id}`} data-method="delete">Eliminar</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
