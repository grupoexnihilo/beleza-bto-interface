// --- VERSÃO QUE RECEBE ISOString E PASSA DIRETO (Despesas) ---
import pkg from 'pg';
import { v4 as uuidv4 } from 'uuid';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') { return res.status(405).json({ message: 'Método não permitido' }); }

  const {
    unidadeId, emailOperador,
    dataCompetencia, // Espera ISOString UTC
    dataPagamento,   // Espera ISOString UTC
    categoria, formaPagamento, // ID da Forma Pagamento
    descricao, valor,
  } = req.body;

  // Validação mais robusta (exemplo)
  if (!unidadeId || !emailOperador || !dataCompetencia || !categoria || !valor || !formaPagamento) {
    console.error("[API addLancamento] Campos obrigatórios em falta:", req.body);
    return res.status(400).json({ message: 'Campos obrigatórios em falta ou inválidos.' });
  }

  let client;
  try {
    client = await pool.connect();
    // REMOVIDO: SET TIME ZONE

    const grupoQuery = 'SELECT grupo FROM dados WHERE categoria = $1 LIMIT 1';
    const grupoResult = await client.query(grupoQuery, [categoria]);
    const grupo = grupoResult.rows.length > 0 ? grupoResult.rows[0].grupo : null;

    // --- QUERY INSERT SEM TO_DATE ---
    // Passa a string ISO diretamente. PostgreSQL DATE deve extrair a data correta.
    const insertQuery = `
      INSERT INTO lancamentos (
        id_de_lancamento, lancado_por, data_competencia, data_pagamento, valor_r,
        tipo_de_operacao, forma_de_pagamento, grupo, categoria,
        descricao, status, unidade
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;
    // --- FIM MUDANÇA ---

    // Usa a dataPagamento recebida (ISOString) ou a dataCompetencia (ISOString)
    const dataPagamentoFinal = dataPagamento || dataCompetencia;

    // Passamos as strings ISO diretamente
    const valores = [
      uuidv4(), emailOperador,
      dataCompetencia,      // <-- ISOString UTC
      dataPagamentoFinal,   // <-- ISOString UTC
      parseFloat(valor), 'Despesa', formaPagamento, // ID da Forma Pagamento
      grupo, categoria, descricao, 'PAGO', unidadeId
    ];

    await client.query(insertQuery, valores);

    res.status(201).json({ message: 'Despesa salva com sucesso!' });

  } catch (error) {
    console.error('[ERROR] Erro ao salvar despesa (passando ISOString):', error);
    res.status(500).json({ message: 'Erro interno do servidor ao salvar despesa.', error: error.message });
  } finally {
    if (client) { client.release(); }
  }
}