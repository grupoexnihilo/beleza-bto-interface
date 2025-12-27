import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  
  const { unidadeId } = req.query;
  let client;

  try {
    client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM clientes WHERE unidade = $1 ORDER BY nome ASC', 
      [unidadeId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('[ERROR] Erro ao buscar clientes:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) { client.release(); }
  }
}