import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db/oracle';

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const t = Number(sp.get('threshold') ?? 3);
  const res = await execute(
    `SELECT libro_id, titulo, autor, num_copias
     FROM LIBROS
     WHERE num_copias <= :t
     ORDER BY num_copias ASC`,
    { t }
  );
  return NextResponse.json((res as any).rows ?? []);
}
