import { Pool } from 'pg';

let pool: Pool;

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 2000, 
};

if (process.env.NODE_ENV === 'production') {
  pool = new Pool(poolConfig);  
} else {
  if (!(global as any).pool) {
    (global as any).pool = new Pool(poolConfig);
  }
  pool = (global as any).pool;
}

export const query = (text: string, params?: any[]) => {
  const start = Date.now();
  return pool.query(text, params).then((res) => {
    const duration = Date.now() - start;
    if (duration > 100) {
      console.log('Slowing Query:', { text, duration, rows: res.rowCount });
    }
    return res;
  });
};