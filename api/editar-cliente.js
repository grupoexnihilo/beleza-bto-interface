import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Método não permitido' });

  const { id, nome, whatsapp, email, cpf, atividade, data_nascimento } = req.body;

  let client;
  try {
    client = await pool.connect();
    // Query simplificada para testarmos a gravação com sucesso nos campos principais
    const queryText = `
      UPDATE clientes 
      SET nome=$1, whatsapp=$2, email=$3, cpf=$4, atividade=$5, data_nascimento=$6
      WHERE id=$7
    `;
    await client.query(queryText, [nome, whatsapp, email, cpf, atividade, data_nascimento, id]);
    res.status(200).json({ message: 'Sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) client.release();
  }
}