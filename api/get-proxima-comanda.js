import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Pega a unidade da URL, se não tiver usa '999'
  const unidadeId = req.query.unidadeId || '999';

  try {
    // Busca o próximo número no Neon
    const { rows } = await sql`
      SELECT COALESCE(MAX(numero_comanda), 0) + 1 AS proximo 
      FROM comandas 
      WHERE unidade_id = ${unidadeId}
    `;

    const numero = rows[0].proximo;

    // Retorna o resultado para o seu Modal
    return res.status(200).json({ numero: numero });

  } catch (error) {
    // Se der erro, ele vai escrever o motivo no log da Vercel
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}