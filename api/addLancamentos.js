// --- V.FINAL + GRUPO + TO_DATE + DEBUG TypeError CORRIGIDO ---
import pkg from 'pg';
import { v4 as uuidv4 } from 'uuid';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // Garantir que está correto
  ssl: { rejectUnauthorized: false },
});

// ... (Função getFormaPagamentoMap mantida como antes) ...
let fpMapCache = null; /* ... */ async function getFormaPagamentoMap(client) { /* ... */ }

export default async function handler(req, res) {
 if (req.method !== 'POST') { return res.status(405).json({ message: 'Método não permitido' }); }

 console.log("[DEBUG V3 addLancamentos] Função iniciada."); // Log V3
 const {
    unidadeId, emailOperador, dataCompetencia, dataPagamento,
    colaborador, categoria, pagamentos,
  } = req.body;

  console.log("[DEBUG V3 addLancamentos] req.body recebido:", req.body);
  console.log("[DEBUG V3 addLancamentos] Objeto 'pagamentos' após desestruturação:", pagamentos);
  console.log("[DEBUG V3 addLancamentos] Tipo de 'pagamentos':", typeof pagamentos);

  // Validação mais robusta
  if (!unidadeId || !emailOperador || !dataCompetencia || !colaborador || !categoria || typeof pagamentos !== 'object' || pagamentos === null) {
      console.error("[ERROR V3 addLancamentos] Campos obrigatórios em falta ou 'pagamentos' inválido.", { unidadeId, emailOperador, dataCompetencia, colaborador, categoria, pagamentos });
    return res.status(400).json({ message: 'Campos obrigatórios em falta ou dados de pagamento inválidos.' });
  }

  let client;
  try {
    client = await pool.connect();
    console.log("[DEBUG V3 addLancamentos] Conectado ao DB.");

    const formaPagamentoMap = await getFormaPagamentoMap(client);
    const grupoQuery = 'SELECT grupo FROM dados WHERE categoria = $1 LIMIT 1';
    const grupoResult = await client.query(grupoQuery, [categoria]);
    const grupo = grupoResult.rows.length > 0 ? grupoResult.rows[0].grupo : null;
    console.log(`[DEBUG V3 addLancamentos] Grupo para '${categoria}': ${grupo}`);

    const dataPagamentoFinal = dataPagamento || dataCompetencia;

    await client.query('BEGIN');
    console.log("[DEBUG V3 addLancamentos] Transação iniciada.");

    const insertQuery = `
      INSERT INTO lancamentos (
        id_de_lancamento, lancado_por, data_competencia, data_pagamento, valor_r,
        profissional, tipo_de_operacao, forma_de_pagamento, grupo, categoria, status, unidade
      )
      VALUES ($1, $2, TO_DATE($3, 'YYYY-MM-DD'), TO_DATE($4, 'YYYY-MM-DD'), $5, $6, $7, $8, $9, $10, $11, $12)
    `;

    let lancamentosCriados = 0;

    console.log("[DEBUG V3 addLancamentos] Iniciando loop 'for...in pagamentos'. Objeto:", pagamentos);
    if (typeof pagamentos !== 'object' || pagamentos === null) { throw new Error("'pagamentos' não é um objeto iterável."); }

    // --- LOOP REVISADO ---
    for (const formaLabel in pagamentos) {
        // Verifica se a propriedade pertence ao objeto
        if (Object.hasOwnProperty.call(pagamentos, formaLabel)) {
            console.log(`[DEBUG V3 addLancamentos] Loop - Processando forma: "${formaLabel}"`);
            const valorRaw = pagamentos[formaLabel]; // Pega o valor (pode ser string, numero, null)
            console.log(`[DEBUG V3 addLancamentos] Loop - Valor Raw: "${valorRaw}", Tipo: ${typeof valorRaw}`);

            // Converte para float, tratando null/undefined/string vazia como 0
            const valor = parseFloat(valorRaw || '0');
             console.log(`[DEBUG V3 addLancamentos] Loop - Valor (float): ${valor}`);

            if (!isNaN(valor) && valor > 0) { // Garante que é número válido e > 0
                const formaChaveMapa = formaLabel.toLowerCase(); // Chave para buscar no mapa
                console.log(`[DEBUG V3 addLancamentos] Loop - Buscando ID para chave: "${formaChaveMapa}"`);
                const formaId = formaPagamentoMap[formaChaveMapa]; // Busca ID

                if (!formaId) {
                    console.warn(`[WARN V3] Forma de pagamento "${formaLabel}" (chave: ${formaChaveMapa}) não encontrada no mapa. Pulando.`);
                    continue; // Pula este lançamento
                }
                console.log(`[DEBUG V3 addLancamentos] Loop - Forma ID encontrada: ${formaId}. Inserindo...`);

                const valores = [
                  uuidv4(), emailOperador, dataCompetencia, dataPagamentoFinal, // Strings YYYY-MM-DD
                  valor, colaborador, 'Receita',
                  formaId, grupo, categoria, 'RECEBIDO', unidadeId
                ];
                await client.query(insertQuery, valores);
                lancamentosCriados++;
                console.log(`[DEBUG V3 addLancamentos] Loop - Inserção para "${formaLabel}" concluída.`);
            } else {
                 console.log(`[DEBUG V3 addLancamentos] Loop - Valor inválido ou zero para "${formaLabel}". Pulando.`);
            }
        } // Fim do hasOwnProperty
    } // --- FIM DO LOOP REVISADO ---

    console.log("[DEBUG V3 addLancamentos] Fim do loop. Executando COMMIT.");
    await client.query('COMMIT');

    if (lancamentosCriados === 0) { return res.status(400).json({ message: 'Nenhum valor válido foi inserido.' }); }
    res.status(201).json({ message: `${lancamentosCriados} lançamento(s) de receita salvo(s) com sucesso!` });

  } catch (error) {
    if (client) { await client.query('ROLLBACK'); }
    console.error('[ERROR V3] Erro ao salvar receitas:', error); // Log de erro V3
    res.status(500).json({ message: 'Erro interno do servidor ao salvar receitas.', error: error.message });
  } finally {
    if (client) { client.release(); console.log("[DEBUG V3 addLancamentos] Conexão libertada."); }
  }
}