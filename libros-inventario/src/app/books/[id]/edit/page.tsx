'use client';

import { useEffect, useState } from 'react';

export default function EditBookPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [form, setForm] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/books/${id}`);
      const data = await res.json();
      setForm({
        titulo: data.TITULO ?? data.titulo,
        autor: data.AUTOR ?? data.autor,
        anio_publicacion: data.ANIO_PUBLICACION ?? data.anio_publicacion,
        genero_id: data.GENERO_ID ?? data.genero_id,
        num_copias: data.NUM_COPIAS ?? data.num_copias,
      });
    })();
  }, [id]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    const { name, value } = e.target;
    setForm((f: any) => ({ ...f, [name]: name.includes('anio') || name.includes('num_copias') ? Number(value) : value }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      window.location.href = '/books';
    } else {
      const j = await res.json().catch(() => ({}));
      setMsg(j.error || 'Error al guardar');
    }
  }

  if (!form) return <p>Cargando...</p>;

  return (
    <section>
      <h1>Editar libro #{id}</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
        <input name="titulo" placeholder="Título" value={form.titulo} onChange={onChange} required />
        <input name="autor" placeholder="Autor" value={form.autor} onChange={onChange} required />
        <input name="anio_publicacion" type="number" value={form.anio_publicacion} onChange={onChange} required />
        <input name="genero_id" placeholder="Género ID (opcional)" value={form.genero_id ?? ''} onChange={onChange} />
        <input name="num_copias" type="number" min={0} value={form.num_copias} onChange={onChange} required />
        <button type="submit">Guardar</button>
      </form>
      {msg && <p>{msg}</p>}
    </section>
  );
}
