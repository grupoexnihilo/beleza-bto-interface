import pg from 'pg';
const { Pool } = pg;

// Forçamos a leitura da variável e configuramos o SSL exigido pelo Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const { id, nome, whatsapp, data_nascimento, observacoes, unidade, cadastrado_por } = req.body;

    // Log para depuração no painel da Vercel (ajuda a ver se os dados chegaram)
    console.log("Tentando salvar cliente para unidade:", unidade);

    const query = `
      INSERT INTO clientes (id, nome, whatsapp, data_nascimento, observacoes, unidade, cadastrado_por)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    const values = [id, nome, whatsapp, data_nascimento, observacoes, unidade, cadastrado_por];
    const result = await pool.query(query, values);

    return res.status(200).json({ message: 'Sucesso', cliente: result.rows[0] });
  } catch (error) {
    console.error("Erro detalhado na API:", error.message);
    return res.status(500).json({ error: error.message });
  }
}