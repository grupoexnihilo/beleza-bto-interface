import pg from 'pg';

const { Pool } = pg;

// Configuração da conexão com o Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Usaremos variável de ambiente por segurança
  ssl: {
    rejectUnauthorized: false // Necessário para conexões seguras com o Neon
  }
});

export default async function handler(req, res) {
  // Só permitimos o método POST (para enviar dados)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { id, nome, whatsapp, data_nascimento, observacoes } = req.body;

  try {
    const client = await pool.connect();
    
    // Comando SQL para inserir o cliente
    const query = `
      INSERT INTO clientes (id, nome, whatsapp, data_nascimento, observacoes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    
    const values = [id, nome, whatsapp, data_nascimento, observacoes];
    const result = await client.query(query, values);
    
    client.release();

    return res.status(200).json({ 
      message: 'Cliente cadastrado com sucesso!', 
      cliente: result.rows[0] 
    });

  } catch (error) {
    console.error('Erro ao salvar no Neon:', error);
    return res.status(500).json({ error: 'Erro interno no servidor ao salvar cliente.' });
  }
}