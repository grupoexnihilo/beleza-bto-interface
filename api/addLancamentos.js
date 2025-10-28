// --- V.FINAL + GRUPO + FIX FUSO HORÁRIO (Receitas) ---
import pkg from 'pg';
import { v4 as uuidv4 } from 'uuid';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

// Helper para garantir que a data seja tratada como UTC (o mesmo da outra API)
const ensureUTCDateString = (dateString) => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
    return `${dateString}T00:00:00Z`;
};

// ... (Função getFormaPagamentoMap mantida como antes) ...
let fpMapCache = null; /* ... */ async function getFormaPagamentoMap(client) { /* ... */ }

export default async function handler(req, res) {
 // ... (verificação de método POST mantida) ...
 if (req.method !== 'POST') { /* ... */ }

 const {
    unidadeId, emailOperador, dataCompetencia, dataPagamento,
    colaborador, categoria, pagamentos,
  } = req.body;

  if (!unidadeId || !emailOperador || !dataCompetencia || !colaborador || !categoria) {
    return res.status(400).json({ message: 'Campos de cabeçalho obrigatórios.' });
  }

  let client;
  try {
    client = await pool.connect();

    const formaPagamentoMap = await getFormaPagamentoMap(client);
    const grupoQuery = 'SELECT grupo FROM dados WHERE categoria = $1 LIMIT 1';
    const grupoResult = await client.query(grupoQuery, [categoria]);
    const grupo = grupoResult.rows.length > 0 ? grupoResult.rows[0].grupo : null;

    // --- MUDANÇA AQUI ---
    const dataCompetenciaUTC = ensureUTCDateString(dataCompetencia);
    const dataPagamentoFinal = dataPagamento || dataCompetencia;
    const dataPagamentoUTC = ensureUTCDateString(dataPagamentoFinal);
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
        if (!formaId) {
            console.warn(`[WARN] Forma de pagamento "${formaLabel}" não encontrada. Pulando.`);
            continue;
        }

        const valores = [
          uuidv4(), emailOperador,
          dataCompetenciaUTC, // <-- Usa a string UTC
          dataPagamentoUTC,   // <-- Usa a string UTC
          valor, colaborador, 'Receita',
          formaId, grupo, categoria, 'RECEBIDO', unidadeId
        ];
        await client.query(insertQuery, valores);
        lancamentosCriados++;
      }
    }

    await client.query('COMMIT');

    if (lancamentosCriados === 0) { return res.status(400).json({ message: 'Nenhum valor válido foi inserido.' }); }
    res.status(201).json({ message: `${lancamentosCriados} lançamento(s) de receita salvo(s) com sucesso!` });

  } catch (error) {
    if (client) { await client.query('ROLLBACK'); }
    console.error('[ERROR] Erro ao salvar receitas:', error); // Log mais explícito
    res.status(500).json({ message: 'Erro interno do servidor ao salvar receitas.', error: error.message });
  } finally {
    if (client) { client.release(); }
  }
}