import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  console.log(`[LOG API getClientes] Chamada. Params:`, req.query);

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { unidadeId } = req.query;

  if (!unidadeId) {
    return res.status(400).json({ message: 'A Unidade é obrigatória para listar clientes' });
  }

  let client;
  try {
    client = await pool.connect();
    
    // Buscamos todos os campos para garantir que o Modal tenha dados
    const queryText = `
      SELECT * FROM clientes 
      WHERE unidade = $1 
      ORDER BY nome ASC;
    `;

    const result = await client.query(queryText, [unidadeId]);
    console.log(`[LOG API getClientes] Sucesso: ${result.rows.length} clientes encontrados.`);
    
    res.status(200).json(result.rows);

  } catch (error) {
    console.error('[ERROR API getClientes]', error);
    res.status(500).json({ message: 'Erro ao buscar clientes.', error: error.message });
  } finally {
    if (client) client.release();
  }
}