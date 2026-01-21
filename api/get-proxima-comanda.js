// api/get-proxima-comanda.js
import { db } from '@vercel/postgres'; // Ou a biblioteca que você usa para conectar ao Neon

export default async function handler(req, res) {
  const { unidadeId } = req.query;

  try {
    // Essa linha vai no Neon e olha qual o maior número de comanda daquela unidade
    const result = await db.query(`
      SELECT COALESCE(MAX(numero_comanda), 0) + 1 AS proximo 
      FROM comandas 
      WHERE unidade_id = $1
    `, [unidadeId]);

    const proximoNumero = result.rows[0].proximo;

    // Retorna o número para o sistema
    return res.status(200).json({ numero: proximoNumero });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}