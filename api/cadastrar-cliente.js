import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido' });

  const { 
    id, nome, whatsapp, data_nascimento, unidade, cadastrado_por,
    cpf, email, endereco, numero, complemento, bairro, cidade, estado, atividade, cep, data_cadastro 
  } = req.body;
  
  let client;

  try {
    client = await pool.connect();
    const insertQuery = `
      INSERT INTO clientes (
        id, nome, whatsapp, data_nascimento, unidade, cadastrado_por,
        cpf, email, endereco, numero, complemento, bairro, cidade, estado, atividade, cep, data_cadastro
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `;
    
    // Garantimos que se data_cadastro não vier do front, o banco use a data atual
    const valores = [
      id, nome, whatsapp, data_nascimento || null, unidade, cadastrado_por,
      cpf, email, endereco, numero, complemento, bairro, cidade, estado, atividade, cep, 
      data_cadastro || new Date().toISOString().split('T')[0]
    ];

    await client.query(insertQuery, valores);
    res.status(201).json({ message: 'Cliente cadastrado com sucesso!' });
  } catch (error) {
    console.error('[ERROR] API Cadastro:', error);
    res.status(500).json({ message: 'Erro no servidor.', error: error.message });
  } finally {
    if (client) client.release();
  }
}