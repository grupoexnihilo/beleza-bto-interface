// --- VERSÃO QUE RECEBE ISOString E PASSA DIRETO (Editar) ---
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

// Helper (mantido por consistência, embora o frontend agora envie ISO)
const ensureUTCDateString = (dateString) => {
    if (!dateString) return null;
    if (dateString.includes('T')) return dateString; // Já é ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return `${dateString}T00:00:00Z`; // Converte YYYY-MM-DD
    return null; // Formato inválido
};

export default async function handler(req, res) {
  if (req.method !== 'PATCH') { return res.status(405).json({ message: 'Método não permitido' }); }

  const { 
    id_de_lancamento, dataCompetencia, dataPagamento, // Espera ISOString
    categoria, descricao, valor_r, profissional, formaPagamento
  } = req.body;

  if (!id_de_lancamento || !categoria || !valor_r || !dataCompetencia) {
    return res.status(400).json({ message: 'ID, Categoria, Valor e Data Competência são obrigatórios.' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    // REMOVIDO: SET TIME ZONE

    const grupoQuery = 'SELECT grupo FROM dados WHERE categoria = $1 LIMIT 1';
    const grupoResult = await client.query(grupoQuery, [categoria]);
    if (grupoResult.rows.length === 0) { throw new Error(`Categoria "${categoria}" não encontrada.`); }
    const grupo = grupoResult.rows[0].grupo;

    // --- MUDANÇA NA QUERY UPDATE: Removendo TO_DATE ---
    const updateQuery = `
      UPDATE lancamentos
      SET 
        data_competencia = $1,     -- Passa ISOString direto
        data_pagamento = $2,       -- Passa ISOString direto
        categoria = $3,
        descricao = $4,
        valor_r = $5,
        profissional = $6,
        forma_de_pagamento = $7,
        grupo = $8
      WHERE 
        id_de_lancamento = $9
      RETURNING *;
    `;
    // --- FIM MUDANÇA ---
    
    // O frontend já envia ISOString UTC
    const dataPagamentoFinal = dataPagamento || dataCompetencia;

    const valores = [
      dataCompetencia, // ISOString
      dataPagamentoFinal, // ISOString
      categoria,
      descricao,
      parseFloat(valor_r),
      profissional,
      formaPagamento,
      grupo,
      id_de_lancamento
    ];

    const result = await client.query(updateQuery, valores);
    if (result.rowCount === 0) { throw new Error("Lançamento não encontrado."); }

    await client.query('COMMIT');
    
    console.log(`[API updateLancamento] Lançamento ${id_de_lancamento} atualizado.`);
    res.status(200).json(result.rows[0]); 

  } catch (error) {
    if (client) { await client.query('ROLLBACK'); }
    console.error('[ERROR API updateLancamento]', error);
    res.status(500).json({ message: `Erro interno do servidor: ${error.message}` });
  } finally {
    if (client) { client.release(); }
  }
}