import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  const { termo, unidadeId } = req.query;
  let client;

  try {
    client = await pool.connect();
    // Busca clientes pelo nome (ILIKE ignora maiúsculas/minúsculas)
    const result = await client.query(
      `SELECT id, nome, whatsapp FROM clientes 
       WHERE unidade = $1 AND nome ILIKE $2 
       LIMIT 5`, 
      [unidadeId, `%${termo}%`]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (client) client.release();
  }
}