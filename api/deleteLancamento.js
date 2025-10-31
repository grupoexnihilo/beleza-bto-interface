// Este é o ficheiro: /api/deleteLancamento.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  // 1. Apenas aceitar método DELETE
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  // 2. Obter o ID do lançamento a partir do corpo da requisição
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID do lançamento é obrigatório.' });
  }

  let client;
  try {
    client = await pool.connect();
    
    // 3. Executar a query DELETE
    // (Opcional: Adicionar "AND lancado_por = $2" e passar user.email para segurança extra)
    const query = 'DELETE FROM lancamentos WHERE id_de_lancamento = $1 RETURNING *';
    const result = await client.query(query, [id]);

    if (result.rowCount === 0) {
      // Nenhum lançamento foi apagado (talvez já não existisse)
      return res.status(404).json({ message: 'Lançamento não encontrado.' });
    }

    // 4. Retornar sucesso
    console.log(`[API deleteLancamento] Lançamento ${id} apagado com sucesso.`);
    // 204 No Content é uma resposta padrão para DELETE bem-sucedido sem corpo
    return res.status(204).send(); 

  } catch (error) {
    console.error('[ERROR API deleteLancamento]', error);
    res.status(500).json({ message: 'Erro interno do servidor ao apagar lançamento.', error: error.message });
  } finally {
    if (client) { client.release(); }
  }
}