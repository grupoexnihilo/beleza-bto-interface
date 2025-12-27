import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { id, nome, whatsapp, data_nascimento, observacoes, unidade, cadastrado_por } = req.body;

    // A query agora inclui unidade e cadastrado_por
    const query = `
      INSERT INTO clientes (id, nome, whatsapp, data_nascimento, observacoes, unidade, cadastrado_por)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    const values = [id, nome, whatsapp, data_nascimento, observacoes, unidade, cadastrado_por];
    const result = await pool.query(query, values);

    return res.status(200).json({ message: 'Cliente salvo com sucesso!', cliente: result.rows[0] });
  } catch (error) {
    console.error("Erro na API de Clientes:", error);
    return res.status(500).json({ error: error.message });
  }
}