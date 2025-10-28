// --- V.FINAL + GRUPO + SET TIME ZONE (Receitas) ---
import pkg from 'pg';
import { v4 as uuidv4 } from 'uuid';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

// REMOVIDA a função ensureUTCDateString
// ... (Função getFormaPagamentoMap mantida como antes) ...
let fpMapCache = null; /* ... */ async function getFormaPagamentoMap(client) { /* ... */ }


export default async function handler(req, res) {
 // ... (verificação de método POST mantida) ...
 if (req.method !== 'POST') { /* ... */ }

 const {
    unidadeId, emailOperador, dataCompetencia, dataPagamento, // Espera YYYY-MM-DD
    colaborador, categoria, pagamentos,
  } = req.body;

  // --- ADICIONAR ESTE LOG ---
  console.log("[DEBUG API addLancamentos] Objeto 'pagamentos' recebido:", pagamentos);
  // -------------------------

  if (!unidadeId || !emailOperador || !dataCompetencia || !colaborador || !categoria) {
    return res.status(400).json({ message: 'Campos de cabeçalho obrigatórios.' });
  }

  let client;
  try {
    client = await pool.connect();

    // --- NOVO: Definir o Fuso Horário da Sessão ---
    await client.query("SET TIME ZONE 'America/Sao_Paulo'");
    console.log("[INFO] Timezone da sessão definido para America/Sao_Paulo");
    // --- FIM NOVO ---

    const formaPagamentoMap = await getFormaPagamentoMap(client);
    const grupoQuery = 'SELECT grupo FROM dados WHERE categoria = $1 LIMIT 1';
    const grupoResult = await client.query(grupoQuery, [categoria]);
    const grupo = grupoResult.rows.length > 0 ? grupoResult.rows[0].grupo : null;

    // --- MUDANÇA: Define dataPagamentoFinal ---
    const dataPagamentoFinal = dataPagamento || dataCompetencia;
    // --- FIM MUDANÇA ---


    await client.query('BEGIN');

    const insertQuery = `
      INSERT INTO lancamentos (
        id_de_lancamento, lancado_por, data_competencia, data_pagamento, valor_r,
        profissional, tipo_de_operacao, forma_de_pagamento, grupo, categoria, status, unidade
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;

    let lancamentosCriados = 0;

    for (const formaLabel in pagamentos) {
      const valor = parseFloat(pagamentos[formaLabel]);
      if (valor > 0) {
        const formaId = formaPagamentoMap[formaLabel.toLowerCase()];
        if (!formaId) { /* ... aviso ... */ continue; }

        const valores = [
          uuidv4(), emailOperador,
          dataCompetencia,      // <-- String YYYY-MM-DD
          dataPagamentoFinal,   // <-- String YYYY-MM-DD
          valor, colaborador, 'Receita',
          formaId, grupo, categoria, 'RECEBIDO', unidadeId
        ];
        await client.query(insertQuery, valores);
        lancamentosCriados++;
      }
    }

    await client.query('COMMIT');

    if (lancamentosCriados === 0) { /* ... */ }
    res.status(201).json({ /* ... */ });

  } catch (error) {
    if (client) { await client.query('ROLLBACK'); }
    console.error('[ERROR] Erro ao salvar receitas (com SET TIMEZONE):', error);
    res.status(500).json({ message: 'Erro interno do servidor ao salvar receitas.', error: error.message });
  } finally {
    if (client) { client.release(); }
  }
}