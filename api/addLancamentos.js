// --- V.FINAL + GRUPO + TO_DATE + DEBUG TypeError SEM CACHE ---
import pkg from 'pg';
import { v4 as uuidv4 } from 'uuid';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

// --- FUNÇÃO getFormaPagamentoMap SIMPLIFICADA (SEM CACHE) ---
async function getFormaPagamentoMap(client) {
  console.log("[DEBUG getFPMap V2] Buscando mapa FP do banco (sem cache)."); // Log G1
  try {
    const fpQuery = 'SELECT id_forma_de_pagamento, nome_da_forma FROM formas_de_pagamento';
    console.log("[DEBUG getFPMap V2] Executando query:", fpQuery); // Log G2
    const fpResult = await client.query(fpQuery);
    console.log(`[DEBUG getFPMap V2] Query retornou ${fpResult.rowCount} linhas.`); // Log G3

    const map = fpResult.rows.reduce((acc, fp) => {
      if (fp.nome_da_forma && fp.id_forma_de_pagamento) {
          acc[fp.nome_da_forma.toLowerCase()] = fp.id_forma_de_pagamento;
      } else {
          console.warn("[WARN getFPMap V2] Linha inválida encontrada:", fp);
      }
      return acc;
    }, {});

    console.log("[DEBUG getFPMap V2] Mapa criado:", map); // Log G4

    if (Object.keys(map).length === 0) {
      console.error("[ERROR getFPMap V2] O mapa final está vazio! Verifique a tabela formas_de_pagamento.");
      // Lança erro se o mapa estiver vazio, pois é essencial
      throw new Error("Mapeamento de formas de pagamento resultou vazio.");
    }
    console.log("[DEBUG getFPMap V2] Retornando mapa."); // Log G5
    return map;

  } catch (error) {
    console.error("[ERROR getFPMap V2] Erro DENTRO da função getFormaPagamentoMap:", error); // Log G6
    // Re-lança o erro para ser capturado pelo handler principal
    throw new Error(`Falha CRÍTICA ao obter mapa FP: ${error.message}`);
  }
}
// --- FIM FUNÇÃO getFormaPagamentoMap ---


export default async function handler(req, res) {
  if (req.method !== 'POST') { return res.status(405).json({ message: 'Método não permitido' }); }

  console.log("[DEBUG V5 addLancamentos] Função iniciada.");
  const {
    unidadeId, emailOperador, dataCompetencia, dataPagamento,
    colaborador, categoria, pagamentos,
  } = req.body;
  console.log("[DEBUG V5 addLancamentos] req.body:", req.body);
  console.log("[DEBUG V5 addLancamentos] Objeto 'pagamentos':", pagamentos);

  if (!unidadeId || !emailOperador || !dataCompetencia || !colaborador || !categoria || typeof pagamentos !== 'object' || pagamentos === null) {
      console.error("[ERROR V5 addLancamentos] Campos obrigatórios em falta ou 'pagamentos' inválido.");
      return res.status(400).json({ message: 'Campos obrigatórios em falta ou dados de pagamento inválidos.' });
  }

  let client;
  let formaPagamentoMap = null; // Inicializa como null
  try {
    client = await pool.connect();
    console.log("[DEBUG V5 addLancamentos] Conectado ao DB.");

    // --- CHAMADA E VERIFICAÇÃO ROBUSTA DO MAPA ---
    try {
        formaPagamentoMap = await getFormaPagamentoMap(client);
        console.log("[DEBUG V5 addLancamentos] Mapa FP recebido no handler:", formaPagamentoMap);
        // Verifica explicitamente se é um objeto válido APÓS a chamada
        if (typeof formaPagamentoMap !== 'object' || formaPagamentoMap === null) {
          console.error("[ERROR V5 addLancamentos] getFormaPagamentoMap retornou valor inválido:", formaPagamentoMap);
          throw new Error("Mapa de formas de pagamento inválido ou não carregado.");
        }
    } catch (mapError) {
        // Se getFormaPagamentoMap lançar um erro, captura aqui e pára a execução
        console.error("[ERROR V5 addLancamentos] Erro ao obter mapa FP:", mapError);
        throw mapError; // Re-lança para o catch principal
    }
    // --- FIM DA VERIFICAÇÃO ---

    const grupoQuery = 'SELECT grupo FROM dados WHERE categoria = $1 LIMIT 1';
    const grupoResult = await client.query(grupoQuery, [categoria]);
    const grupo = grupoResult.rows.length > 0 ? grupoResult.rows[0].grupo : null;
    console.log(`[DEBUG V5 addLancamentos] Grupo para '${categoria}': ${grupo}`);

    const dataPagamentoFinal = dataPagamento || dataCompetencia;

    await client.query('BEGIN');
    console.log("[DEBUG V5 addLancamentos] Transação iniciada.");

    const insertQuery = `
      INSERT INTO lancamentos (
        id_de_lancamento, lancado_por, data_competencia, data_pagamento, valor_r,
        profissional, tipo_de_operacao, forma_de_pagamento, grupo, categoria, status, unidade
      )
      VALUES ($1, $2, TO_DATE($3, 'YYYY-MM-DD'), TO_DATE($4, 'YYYY-MM-DD'), $5, $6, $7, $8, $9, $10, $11, $12)
    `;

    let lancamentosCriados = 0;

    console.log("[DEBUG V5 addLancamentos] Iniciando loop 'for...in pagamentos'. Objeto:", pagamentos);
    for (const formaLabel in pagamentos) {
      if (Object.hasOwnProperty.call(pagamentos, formaLabel)) {
          const valorRaw = pagamentos[formaLabel];
          const valor = parseFloat(valorRaw || '0');
          console.log(`[DEBUG V5 addLancamentos] Loop: ${formaLabel} = ${valor}`);

          if (!isNaN(valor) && valor > 0) {
              const formaChaveMapa = formaLabel.toLowerCase();
              // Acesso ao mapa (agora DEVE ser um objeto válido)
              const formaId = formaPagamentoMap[formaChaveMapa];

              if (!formaId) {
                  console.warn(`[WARN V5] Forma "${formaLabel}" (key: ${formaChaveMapa}) não encontrada no mapa. Pulando.`);
                  continue;
              }
              console.log(`[DEBUG V5 addLancamentos] Loop - Inserindo para ${formaLabel} (ID: ${formaId})`);

              const valores = [ uuidv4(), emailOperador, dataCompetencia, dataPagamentoFinal, valor, colaborador, 'Receita', formaId, grupo, categoria, 'RECEBIDO', unidadeId ];
              await client.query(insertQuery, valores);
              lancamentosCriados++;
          }
      }
    }

    console.log("[DEBUG V5 addLancamentos] Fim do loop. Executando COMMIT.");
    await client.query('COMMIT');

    if (lancamentosCriados === 0) { return res.status(400).json({ message: 'Nenhum valor válido foi inserido.' }); }
    res.status(201).json({ message: `${lancamentosCriados} lançamento(s) de receita salvo(s) com sucesso!` });

  } catch (error) {
    // Captura erros da busca do mapa OU do bloco principal
    if (client) { await client.query('ROLLBACK'); } // Garante rollback
    console.error('[ERROR V5] Erro GERAL ao salvar receitas:', error); // Log de erro V5
    res.status(500).json({ message: `Erro interno do servidor: ${error.message}` }); // Retorna mensagem de erro mais específica
  } finally {
    if (client) { client.release(); console.log("[DEBUG V5 addLancamentos] Conexão libertada."); }
  }
}