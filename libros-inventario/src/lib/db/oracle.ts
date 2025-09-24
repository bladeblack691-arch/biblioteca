import oracledb from 'oracledb';

let poolPromise: Promise<oracledb.Pool> | null = null;

async function createPool(): Promise<oracledb.Pool> {
  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
  return oracledb.createPool({
    user: process.env.ORACLE_USER!,
    password: process.env.ORACLE_PASSWORD!,
    connectString: process.env.ORACLE_CONNECT_STRING!,
    poolMin: Number(process.env.ORACLE_POOL_MIN ?? 1),
    poolMax: Number(process.env.ORACLE_POOL_MAX ?? 5),
    poolIncrement: Number(process.env.ORACLE_POOL_INCREMENT ?? 1),
    queueTimeout: 60000,
  });
}

export async function getPool(): Promise<oracledb.Pool> {
  if (!poolPromise) poolPromise = createPool();
  return poolPromise;
}

export async function withConnection<T>(fn: (conn: oracledb.Connection) => Promise<T>): Promise<T> {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (error) {
    try { await conn.rollback(); } catch {}
    throw error;
  } finally {
    await conn.close();
  }
}

export async function execute<T = oracledb.Result<unknown>>(
  sql: string,
  binds: Record<string, unknown> = {},
  options: oracledb.ExecuteOptions = {}
): Promise<T> {
  return withConnection(async (conn) => {
    const res = await conn.execute(sql, binds, { autoCommit: false, ...options });
    return res as unknown as T;
  });
}
