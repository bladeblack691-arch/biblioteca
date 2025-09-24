import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { execute } from '@/lib/db/oracle';
import { signJwt } from '@/lib/auth/jwt';
import { audit } from '@/lib/audit';

const schema = z.object({
  usuario_login: z.string().min(3),
  contrasena: z.string().min(6),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });

  const { usuario_login, contrasena } = parsed.data;

  const res = await execute(
    `SELECT u.usuario_id, u.nombre, u.usuario_login, u.contrasena, r.nombre_rol as rol
     FROM USUARIOS u
     JOIN ROLES r ON r.rol_id = u.rol_id
     WHERE u.usuario_login = :login`,
    { login: usuario_login }
  );

  const row = (res as any).rows?.[0];
  if (!row) {
    await audit('LOGIN_FALLIDO', `usuario_login=${usuario_login}`, null);
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  const ok = await bcrypt.compare(contrasena, row.CONTRASENA);
  if (!ok) {
    await audit('LOGIN_FALLIDO', `usuario_login=${usuario_login}`, Number(row.USUARIO_ID));
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  const token = signJwt({
    sub: Number(row.USUARIO_ID),
    role: String(row.ROL),
    name: String(row.NOMBRE),
    login: String(row.USUARIO_LOGIN),
  });

  const resp = NextResponse.json({ ok: true });
  resp.cookies.set('auth', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  await audit('LOGIN_EXITOSO', null, Number(row.USUARIO_ID));
  return resp;
}
