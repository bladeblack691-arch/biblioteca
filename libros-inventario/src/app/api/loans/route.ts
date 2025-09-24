import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withConnection } from '@/lib/db/oracle';
import { verifyJwt } from '@/lib/auth/jwt';
import { audit } from '@/lib/audit';

const loanSchema = z.object({
  usuario_id: z.number().int().positive(),
  libro_id: z.number().int().positive(),
  cantidad: z.number().int().positive().default(1),
  dias: z.number().int().positive().default(7),
});

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth')?.value;
  const user = token ? verifyJwt(token) : null;
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const body = await req.json();
  const parsed = loanSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  const { usuario_id, libro_id, cantidad, dias } = parsed.data;

  await withConnection(async (conn) => {
    const r = await conn.execute(
      `SELECT num_copias FROM LIBROS WHERE libro_id = :id FOR UPDATE`,
      { id: libro_id }
    );
    const row = (r.rows as any[])?.[0];
    if (!row || row.NUM_COPIAS < cantidad) throw new Error('Stock insuficiente');

    await conn.execute(
      `INSERT INTO PRESTAMOS (usuario_id, libro_id, fecha_prestamo, estado)
       VALUES (:u, :b, SYSDATE, 'PRESTADO')`,
      { u: usuario_id, b: libro_id }
    );
    await conn.execute(
      `UPDATE LIBROS SET num_copias = num_copias - :q WHERE libro_id = :id`,
      { q: cantidad, id: libro_id }
    );
  });
  await audit('PRESTAMO_CREAR', `usuario_id=${usuario_id}, libro_id=${libro_id}, cantidad=${cantidad}`, user.sub);
  return NextResponse.json({ ok: true });
}
