import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { execute } from '@/lib/db/oracle';
import { verifyJwt } from '@/lib/auth/jwt';
import { audit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  const res = await execute(
    `SELECT l.libro_id as id, l.titulo, l.autor, l.anio_publicacion, g.nombre_genero as genero,
            l.num_copias, l.fecha_registro
     FROM LIBROS l
     LEFT JOIN GENEROS g ON g.genero_id = l.genero_id
     WHERE (:q IS NULL OR l.titulo LIKE '%' || :q || '%' OR l.autor LIKE '%' || :q || '%')
     ORDER BY l.fecha_registro DESC`,
    { q: q || null }
  );
  return NextResponse.json((res as any).rows ?? []);
}

const createSchema = z.object({
  titulo: z.string().min(1),
  autor: z.string().min(1),
  anio_publicacion: z.number().int().gte(1900).lte(new Date().getFullYear()),
  genero_id: z.number().int().optional(),
  num_copias: z.number().int().gte(0),
});

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth')?.value;
  const user = token ? verifyJwt(token) : null;
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const json = await req.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });

  const { titulo, autor, anio_publicacion, genero_id, num_copias } = parsed.data;
  await execute(
    `INSERT INTO LIBROS (titulo, autor, anio_publicacion, genero_id, num_copias)
     VALUES (:titulo, :autor, :anio, :genero, :copias)`,
    { titulo, autor, anio: anio_publicacion, genero: genero_id ?? null, copias: num_copias }
  );
  await audit('LIBRO_CREAR', `${titulo} - ${autor}`, user.sub);
  return NextResponse.json({ ok: true });
}
