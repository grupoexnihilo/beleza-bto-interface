import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ message: 'Método não permitido' });

  const { id } = req.query;

  try {
    const client = await pool.connect();
    await client.query('DELETE FROM clientes WHERE id = $1', [id]);
    client.release();
    res.status(200).json({ message: 'Cliente removido com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}