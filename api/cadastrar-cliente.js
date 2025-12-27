import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido' });

  const { 
    id, nome, whatsapp, data_nascimento, observacoes, unidade, cadastrado_por,
    cpf, email, endereco, numero, complemento, atividade 
  } = req.body;
  
  let client;

  try {
    client = await pool.connect();
    const insertQuery = `
      INSERT INTO clientes (
        id, nome, whatsapp, data_nascimento, observacoes, unidade, cadastrado_por,
        cpf, email, endereco, numero, complemento, atividade
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `;
    
    const valores = [
      id, nome, whatsapp, data_nascimento || null, observacoes, unidade, cadastrado_por,
      cpf, email, endereco, numero, complemento, atividade
    ];

    await client.query(insertQuery, valores);
    res.status(201).json({ message: 'Cliente salvo com sucesso!' });
  } catch (error) {
    console.error('[ERROR] Cadastro Cliente:', error);
    res.status(500).json({ message: 'Erro ao salvar cliente.', error: error.message });
  } finally {
    if (client) client.release();
  }
}