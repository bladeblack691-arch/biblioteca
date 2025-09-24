import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { execute } from '@/lib/db/oracle';
import { verifyJwt } from '@/lib/auth/jwt';
import { audit } from '@/lib/audit';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const res = await execute(
    `SELECT l.*, g.nombre_genero AS genero
     FROM LIBROS l
     LEFT JOIN GENEROS g ON g.genero_id = l.genero_id
     WHERE l.libro_id = :id`,
    { id: Number(params.id) }
  );
  const row = (res as any).rows?.[0];
  if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(row);
}

const updateSchema = z.object({
  titulo: z.string().min(1).optional(),
  autor: z.string().min(1).optional(),
  anio_publicacion: z.number().int().gte(1900).lte(new Date().getFullYear()).optional(),
  genero_id: z.number().int().optional(),
  num_copias: z.number().int().gte(0).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get('auth')?.value;
  const user = token ? verifyJwt(token) : null;
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const json = await req.json();
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  const id = Number(params.id);
  const d = parsed.data;

  await execute(
    `UPDATE LIBROS
     SET titulo = COALESCE(:titulo, titulo),
         autor = COALESCE(:autor, autor),
         anio_publicacion = COALESCE(:anio, anio_publicacion),
         genero_id = COALESCE(:genero, genero_id),
         num_copias = COALESCE(:copias, num_copias)
     WHERE libro_id = :id`,
    {
      id,
      titulo: d.titulo ?? null,
      autor: d.autor ?? null,
      anio: d.anio_publicacion ?? null,
      genero: d.genero_id ?? null,
      copias: d.num_copias ?? null,
    }
  );
  await audit('LIBRO_EDITAR', `libro_id=${id}`, user.sub);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await execute(`DELETE FROM LIBROS WHERE libro_id = :id`, { id: Number(params.id) });
  // Auditoría sin usuario (si quieres, cambia a middleware de auth y exige token)
  return NextResponse.json({ ok: true });
}
