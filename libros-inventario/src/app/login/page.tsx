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
    <section className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-semibold">Iniciar sesión</h1>
        <form onSubmit={onSubmit} className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm text-gray-600">Usuario</label>
            <input className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200" value={usuario_login} onChange={(e) => setLogin(e.target.value)} required />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-gray-600">Contraseña</label>
            <input className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200" type="password" value={contrasena} onChange={(e) => setPass(e.target.value)} required />
          </div>
          <button type="submit" className="mt-2 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">Entrar</button>
        </form>
        {msg && <p className="mt-3 text-sm text-red-600">{msg}</p>}
      </div>
    </section>
  );
}
