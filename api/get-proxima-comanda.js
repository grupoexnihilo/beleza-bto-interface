import pkg from 'pg';
const { Pool } = pkg;

// Usando exatamente a sua estrutura de conexão
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  // Ajuste para permitir requisições GET
  if (req.method !== 'GET') return res.status(405).json({ message: 'Método não permitido' });

  const { unidadeId } = req.query;
  const unidade = unidadeId || '999';

  let client;

  try {
    client = await pool.connect();
    
    // Query para buscar o próximo número (Ajuste 15)
    const query = `
      SELECT COALESCE(MAX(numero_comanda), 0) + 1 AS proximo 
      FROM comandas 
      WHERE unidade_id = $1
    `;
    
    const result = await client.query(query, [unidade]);
    const proximoNumero = result.rows[0].proximo;

    // Retorna no formato JSON que o Modal espera
    res.status(200).json({ numero: proximoNumero });
    
  } catch (error) {
    console.error('[ERROR] API Proxima Comanda:', error);
    res.status(500).json({ message: 'Erro no servidor.', error: error.message });
  } finally {
    if (client) client.release(); // Libera a conexão como no seu código de clientes
  }
}