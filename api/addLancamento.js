// --- V.FINAL + GRUPO + FIX FUSO HORÁRIO (Despesas) ---
import pkg from 'pg';
import { v4 as uuidv4 } from 'uuid';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

// Helper para garantir que a data seja tratada como UTC
const ensureUTCDateString = (dateString) => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        // Se a data for inválida ou null, retorna null para o DB
        return null;
    }
    // Adiciona T00:00:00Z para indicar explicitamente meia-noite UTC
    // O PostgreSQL DATE deve truncar a hora corretamente.
    return `${dateString}T00:00:00Z`;
};


export default async function handler(req, res) {
  // ... (verificação de método POST mantida) ...
  if (req.method !== 'POST') { /* ... */ }

  const {
    unidadeId, emailOperador, dataCompetencia, dataPagamento,
    categoria, formaPagamento, descricao, valor,
  } = req.body;

  if (!unidadeId || !emailOperador || !dataCompetencia || !categoria || !valor) {
    return res.status(400).json({ message: 'Campos obrigatórios em falta.' });
  }

  let client;
  try {
    client = await pool.connect();

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

    // --- MUDANÇA AQUI ---
    const dataCompetenciaUTC = ensureUTCDateString(dataCompetencia);
    // Usa dataPagamento SE existir, senão usa dataCompetencia
    const dataPagamentoFinal = dataPagamento || dataCompetencia;
    const dataPagamentoUTC = ensureUTCDateString(dataPagamentoFinal);
    // --- FIM MUDANÇA ---

    const valores = [
      uuidv4(), emailOperador,
      dataCompetenciaUTC, // <-- Usa a string UTC
      dataPagamentoUTC,   // <-- Usa a string UTC
      parseFloat(valor), 'Despesa', formaPagamento,
      grupo, categoria, descricao, 'PAGO', unidadeId
    ];

    await client.query(insertQuery, valores);

    res.status(201).json({ message: 'Despesa salva com sucesso!' });

  } catch (error) {
    console.error('[ERROR] Erro ao salvar despesa:', error); // Log mais explícito
    res.status(500).json({ message: 'Erro interno do servidor ao salvar despesa.', error: error.message });
  } finally {
    if (client) { client.release(); }
  }
}