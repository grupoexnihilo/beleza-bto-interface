import pkg from 'pg';
const { Pool } = pkg;

// USANDO A MESMA VARIÁVEL DAS SUAS APIS QUE FUNCIONAM
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido' });

  const { id, nome, whatsapp, data_nascimento, observacoes, unidade, cadastrado_por } = req.body;

  let client;
  try {
    client = await pool.connect();

    const insertQuery = `
      INSERT INTO clientes (id, nome, whatsapp, data_nascimento, observacoes, unidade, cadastrado_por)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    // Tratando a data de nascimento: se estiver vazia, enviamos null
    const dataNascFinal = data_nascimento || null;

    const valores = [id, nome, whatsapp, dataNascFinal, observacoes, unidade, cadastrado_por];
    const result = await client.query(insertQuery, valores);

    res.status(201).json({ message: 'Cliente salvo com sucesso!', cliente: result.rows[0] });

  } catch (error) {
    console.error('[ERROR] Erro ao salvar cliente:', error);
    res.status(500).json({ message: 'Erro interno ao salvar cliente.', error: error.message });
  } finally {
    if (client) { client.release(); }
  }
}