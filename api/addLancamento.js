// --- V.FINAL + GRUPO + SET TIME ZONE (Despesas) ---
import pkg from 'pg';
import { v4 as uuidv4 } from 'uuid';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // Corrigido para POSTGRES_URL se estava errado
  ssl: { rejectUnauthorized: false },
});

// REMOVIDA a função ensureUTCDateString

export default async function handler(req, res) {
  // ... (verificação de método POST mantida) ...
  if (req.method !== 'POST') { /* ... */ }

  const {
    unidadeId, emailOperador, dataCompetencia, dataPagamento, // Espera YYYY-MM-DD
    categoria, formaPagamento, descricao, valor,
  } = req.body;

  if (!unidadeId || !emailOperador || !dataCompetencia || !categoria || !valor) {
    return res.status(400).json({ message: 'Campos obrigatórios em falta.' });
  }

  let client;
  try {
    client = await pool.connect();

    // --- NOVO: Definir o Fuso Horário da Sessão ---
    // Use o identificador IANA correto para sua região. 'America/Sao_Paulo' é comum para MG.
    await client.query("SET TIME ZONE 'America/Sao_Paulo'");
    console.log("[INFO] Timezone da sessão definido para America/Sao_Paulo");
    // --- FIM NOVO ---

    const grupoQuery = 'SELECT grupo FROM dados WHERE categoria = $1 LIMIT 1';
    const grupoResult = await client.query(grupoQuery, [categoria]);
    const grupo = grupoResult.rows.length > 0 ? grupoResult.rows[0].grupo : null;

    const insertQuery = `
      INSERT INTO lancamentos (
        id_de_lancamento, lancado_por, data_competencia, data_pagamento, valor_r,
        tipo_de_operacao, forma_de_pagamento, grupo, categoria,
        descricao, status, unidade
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;

    // --- MUDANÇA: Passa as strings YYYY-MM-DD diretamente ---
    const dataPagamentoFinal = dataPagamento || dataCompetencia;
    // --- FIM MUDANÇA ---

    const valores = [
      uuidv4(), emailOperador,
      dataCompetencia,      // <-- String YYYY-MM-DD
      dataPagamentoFinal,   // <-- String YYYY-MM-DD
      parseFloat(valor), 'Despesa', formaPagamento, // ID da Forma Pagamento
      grupo, categoria, descricao, 'PAGO', unidadeId
    ];

    await client.query(insertQuery, valores);

    res.status(201).json({ message: 'Despesa salva com sucesso!' });

  } catch (error) {
    console.error('[ERROR] Erro ao salvar despesa (com SET TIMEZONE):', error);
    res.status(500).json({ message: 'Erro interno do servidor ao salvar despesa.', error: error.message });
  } finally {
    if (client) { client.release(); }
  }
}