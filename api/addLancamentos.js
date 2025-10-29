// --- VERSÃO QUE RECEBE ISOString E PASSA DIRETO (Receitas) ---
import pkg from 'pg';
import { v4 as uuidv4 } from 'uuid';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

// ... (Função getFormaPagamentoMap mantida) ...
let fpMapCache = null; /* ... */ async function getFormaPagamentoMap(client) { /* ... */ }

export default async function handler(req, res) {
 if (req.method !== 'POST') { /* ... */ }

 const {
    unidadeId, emailOperador,
    dataCompetencia, // Espera ISOString UTC
    dataPagamento,   // Espera ISOString UTC
    colaborador, categoria, pagamentos,
  } = req.body;

  // ... (Log de debug e validação mantidos) ...
  console.log("[DEBUG V2 addLancamentos] Função iniciada."); /*...*/
  if (!unidadeId || !emailOperador || /*...*/ typeof pagamentos !== 'object' || pagamentos === null) { /*...*/ }

  let client;
  try {
    client = await pool.connect();
    // REMOVIDO: SET TIME ZONE

    const formaPagamentoMap = await getFormaPagamentoMap(client);
    const grupoQuery = 'SELECT grupo FROM dados WHERE categoria = $1 LIMIT 1';
    const grupoResult = await client.query(grupoQuery, [categoria]);
    const grupo = grupoResult.rows.length > 0 ? grupoResult.rows[0].grupo : null;

    // Usa a dataPagamento recebida (ISOString) ou a dataCompetencia (ISOString)
    const dataPagamentoFinal = dataPagamento || dataCompetencia;

    await client.query('BEGIN');

    // --- QUERY INSERT SEM TO_DATE ---
    // Passa a string ISO diretamente. PostgreSQL DATE deve extrair a data correta.
    const insertQuery = `
      INSERT INTO lancamentos (
        id_de_lancamento, lancado_por, data_competencia, data_pagamento, valor_r,
        profissional, tipo_de_operacao, forma_de_pagamento, grupo, categoria, status, unidade
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;
    // --- FIM MUDANÇA ---

    let lancamentosCriados = 0;

    // ... (Loop for...in mantido, verificando typeof pagamentos) ...
     if (typeof pagamentos !== 'object' || pagamentos === null) throw new Error(/* ... */);
     for (const formaLabel in pagamentos) { /* ... */ }
        if (Object.hasOwnProperty.call(pagamentos, formaLabel)) { /* ... */ }
           // ... (lógica parseFloat, busca formaId mantida) ...
           if (!isNaN(valor) && valor > 0) { /* ... */ }
             const formaId = formaPagamentoMap[formaLabel.toLowerCase()];
             if (!formaId) { /* ... continue ... */ }

                const valores = [
                  uuidv4(), emailOperador,
                  dataCompetencia,      // <-- ISOString UTC
                  dataPagamentoFinal,   // <-- ISOString UTC
                  valor, colaborador, 'Receita',
                  formaId, grupo, categoria, 'RECEBIDO', unidadeId
                ];
                await client.query(insertQuery, valores);
                // ... (incremento lancamentosCriados, logs mantidos) ...
           // ... (fim if valor > 0) ...
        // ... (fim if hasOwnProperty) ...
     // ... (fim loop for) ...

    await client.query('COMMIT');
    // ... (retorno de sucesso mantido) ...

  } catch (error) {
    if (client) { await client.query('ROLLBACK'); }
    console.error('[ERROR] Erro ao salvar receitas (passando ISOString):', error); // Log mais explícito
    res.status(500).json({ message: 'Erro interno do servidor ao salvar receitas.', error: error.message });
  } finally {
    if (client) { client.release(); }
  }
}