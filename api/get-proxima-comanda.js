// api/get-proxima-comanda.js
import { db } from '@vercel/postgres'; 

export default async function handler(req, res) {
  // AJUSTE: Permitir que o navegador acesse a API sem bloqueios (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { unidadeId } = req.query;

  // Se esquecer de passar a unidade, ele assume a 999 para não dar erro 500
  const unidade = unidadeId || '999';

  try {
    const client = await db.connect();
    
    // Query corrigida para buscar o próximo número
    const result = await client.sql`
      SELECT COALESCE(MAX(numero_comanda), 0) + 1 AS proximo 
      FROM comandas 
      WHERE unidade_id = ${unidade};
    `;

    const proximoNumero = result.rows[0].proximo;

    // Retorna o JSON limpo
    return res.status(200).json({ numero: proximoNumero });
    
  } catch (error) {
    console.error('Erro detalhado no Neon:', error);
    // Em caso de erro, enviamos um JSON de erro em vez de texto puro
    return res.status(500).json({ error: 'Erro ao acessar o banco', detalhes: error.message });
  }
}