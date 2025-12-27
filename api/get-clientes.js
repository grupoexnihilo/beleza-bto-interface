import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  
  const { unidadeId } = req.query;

  try {
    const result = await pool.query(
      'SELECT * FROM clientes WHERE unidade = $1 ORDER BY nome ASC', 
      [unidadeId]
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}