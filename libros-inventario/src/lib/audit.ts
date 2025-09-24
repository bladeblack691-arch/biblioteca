import { execute, withConnection } from '@/lib/db/oracle';

export async function audit(accion: string, detalle: string | null, usuarioId?: number | null) {
  try {
    await execute(
      `INSERT INTO AUDITORIA (usuario_id, accion, detalle, fecha_evento)
       VALUES (:u, :a, :d, SYSDATE)`,
      { u: usuarioId ?? null, a: accion, d: detalle }
    );
  } catch {
    // Evitar romper la operación por fallo de auditoría
  }
}
