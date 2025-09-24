'use client';

import { useState } from 'react';

export default function NewBookPage() {
  const [form, setForm] = useState({
    titulo: '',
    autor: '',
    anio_publicacion: new Date().getFullYear(),
    genero_id: '',
    num_copias: 1,
  });
  const [msg, setMsg] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name.includes('anio') || name.includes('num_copias') ? Number(value) : value }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      genero_id: form.genero_id ? Number(form.genero_id) : undefined,
    };
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      window.location.href = '/books';
    } else {
      const j = await res.json().catch(() => ({}));
      setMsg(j.error || 'Error al guardar');
    }
  }

  return (
    <section>
      <h1>Agregar libro</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
        <input name="titulo" placeholder="Título" value={form.titulo} onChange={onChange} required />
        <input name="autor" placeholder="Autor" value={form.autor} onChange={onChange} required />
        <input name="anio_publicacion" type="number" value={form.anio_publicacion} onChange={onChange} required />
        <input name="genero_id" placeholder="Género ID (opcional)" value={form.genero_id} onChange={onChange} />
        <input name="num_copias" type="number" min={0} value={form.num_copias} onChange={onChange} required />
        <button type="submit">Guardar</button>
      </form>
      {msg && <p>{msg}</p>}
    </section>
  );
}
