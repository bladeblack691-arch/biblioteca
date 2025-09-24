'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [usuario_login, setLogin] = useState('');
  const [contrasena, setPass] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_login, contrasena }),
    });
    if (res.ok) {
      setMsg('Ingreso exitoso');
      window.location.href = '/books';
    } else {
      const j = await res.json().catch(() => ({}));
      setMsg(j.error || 'Error');
    }
  }

  return (
    <section>
      <h1>Iniciar sesión</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <label>
          Usuario
          <input value={usuario_login} onChange={(e) => setLogin(e.target.value)} required />
        </label>
        <label>
          Contraseña
          <input type="password" value={contrasena} onChange={(e) => setPass(e.target.value)} required />
        </label>
        <button type="submit">Entrar</button>
      </form>
      {msg && <p>{msg}</p>}
    </section>
  );
}
