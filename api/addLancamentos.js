// --- VERSÃO FINAL CORRIGIDA (TypeError) ---
import pkg from 'pg';
import { v4 as uuidv4 } from 'uuid';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

// --- FUNÇÃO getFormaPagamentoMap SIMPLIFICADA (SEM CACHE) ---
async function getFormaPagamentoMap(client) {
  console.log("[DEBUG getFPMap V2] Buscando mapa FP do banco (sem cache).");
  try {
    const fpQuery = 'SELECT id_forma_de_pagamento, nome_da_forma FROM formas_de_pagamento';
    console.log("[DEBUG getFPMap V2] Executando query:", fpQuery);
    const fpResult = await client.query(fpQuery);
    console.log(`[DEBUG getFPMap V2] Query retornou ${fpResult.rowCount} linhas.`);

    const map = fpResult.rows.reduce((acc, fp) => {
      if (fp.nome_da_forma && fp.id_forma_de_pagamento) {
          // AQUI ESTÁ A CHAVE: Mapeia o nome do banco para a chave do frontend
          // Ex: "Cartão de Débito" -> "debito"
          // Ex: "Crédito" -> "credito"
          // Ex: "Dinheiro" -> "dinheiro"
          // Ex: "Pix" -> "pix"
          // Ex: "Outros" -> "outros"
          
          // *** ESTA LÓGICA PRECISA SER EXATA ***
          // Vamos assumir uma lógica simples de mapeamento aqui:
          const nomeLower = fp.nome_da_forma.toLowerCase();
          
          if (nomeLower.includes('crédito')) { // Se o nome for "Crédito" ou "Cartão de Crédito"
              acc['credito'] = fp.id_forma_de_pagamento;
          } else if (nomeLower.includes('débito')) { // Se for "Débito" ou "Cartão de Débito"
              acc['debito'] = fp.id_forma_de_pagamento;
          } else if (nomeLower.includes('pix')) {
              acc['pix'] = fp.id_forma_de_pagamento;
          } else if (nomeLower.includes('dinheiro')) {
              acc['dinheiro'] = fp.id_forma_de_pagamento;
          } else if (nomeLower.includes('outros')) {
              acc['outros'] = fp.id_forma_de_pagamento;
          } else {
              // Mapeamento padrão se não for nenhum dos acima
              acc[nomeLower] = fp.id_forma_de_pagamento;
          }
      } else {
          console.warn("[WARN getFPMap V2] Linha inválida encontrada:", fp);
      }
      return acc;
    }, {});

    console.log("[DEBUG getFPMap V2] Mapa criado:", map); // Verifique se as chaves 'credito', 'debito', 'outros' estão aqui

    if (Object.keys(map).length === 0) {
      console.error("[ERROR getFPMap V2] O mapa final está vazio!");
      throw new Error("Mapeamento de formas de pagamento resultou vazio.");
    }
    console.log("[DEBUG getFPMap V2] Retornando mapa.");
    return map;

  } catch (error) {
    console.error("[ERROR getFPMap V2] Erro DENTRO da função getFormaPagamentoMap:", error);
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
  let formaPagamentoMap = null;
  try {
    client = await pool.connect();
    console.log("[DEBUG V5 addLancamentos] Conectado ao DB.");

    try {
        formaPagamentoMap = await getFormaPagamentoMap(client);
        console.log("[DEBUG V5 addLancamentos] Mapa FP recebido no handler:", formaPagamentoMap);
        if (typeof formaPagamentoMap !== 'object' || formaPagamentoMap === null) {
          console.error("[ERROR V5 addLancamentos] getFormaPagamentoMap retornou valor inválido:", formaPagamentoMap);
          throw new Error("Mapa de formas de pagamento inválido ou não carregado.");
        }
    } catch (mapError) {
        console.error("[ERROR V5 addLancamentos] Erro ao obter mapa FP:", mapError);
        throw mapError;
    }

    const grupoQuery = 'SELECT grupo FROM dados WHERE categoria = $1 LIMIT 1';
    const grupoResult = await client.query(grupoQuery, [categoria]);
    const grupo = grupoResult.rows.length > 0 ? grupoResult.rows[0].grupo : null;
    console.log(`[DEBUG V5 addLancamentos] Grupo para '${categoria}': ${grupo}`);

    const dataPagamentoFinal = dataPagamento || dataCompetencia;

    await client.query('BEGIN');
    console.log("[DEBUG V5 addLancamentos] Transação iniciada.");

    // Vamos usar a conversão UTC (do frontend) que é a melhor prática
    const insertQuery = `
      INSERT INTO lancamentos (
        id_de_lancamento, lancado_por, data_competencia, data_pagamento, valor_r,
        profissional, tipo_de_operacao, forma_de_pagamento, grupo, categoria, status, unidade
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `; // Removemos o TO_DATE() pois o frontend envia ISOString

    let lancamentosCriados = 0;

    console.log("[DEBUG V5 addLancamentos] Iniciando loop 'for...in pagamentos'. Objeto:", pagamentos);
    if (typeof pagamentos !== 'object' || pagamentos === null) { throw new Error("'pagamentos' não é um objeto iterável."); }

    for (const formaLabel in pagamentos) { // formaLabel é 'dinheiro', 'pix', 'credito', 'debito', 'outros'
      if (Object.hasOwnProperty.call(pagamentos, formaLabel)) {
          const valorRaw = pagamentos[formaLabel];
          const valor = parseFloat(valorRaw || '0');
          console.log(`[DEBUG V5 addLancamentos] Loop: ${formaLabel} = ${valor}`);

          if (!isNaN(valor) && valor > 0) {
              // A formaChaveMapa é a própria formaLabel (ex: 'credito', 'debito')
              // porque ajustámos o getFormaPagamentoMap para criar estas chaves.
              const formaChaveMapa = formaLabel; // Não precisa de toLowerCase() aqui
              console.log(`[DEBUG V5 addLancamentos] Loop - Verificando mapa ANTES de aceder à chave "${formaChaveMapa}". Mapa:`, formaPagamentoMap);
              
              const formaId = formaPagamentoMap[formaChaveMapa]; // Acesso direto

              if (!formaId) {
                  console.warn(`[WARN V5] Forma "${formaLabel}" (key: ${formaChaveMapa}) não encontrada no mapa. Pulando.`);
                  continue;
              }
              console.log(`[DEBUG V5 addLancamentos] Loop - Inserindo para ${formaLabel} (ID: ${formaId})`);

              // Usando as datas ISOString UTC recebidas do frontend
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
    if (client) { await client.query('ROLLBACK'); }
    console.error('[ERROR V5] Erro GERAL ao salvar receitas:', error);
    res.status(500).json({ message: `Erro interno do servidor: ${error.message}` });
  } finally {
    if (client) { client.release(); console.log("[DEBUG V5 addLancamentos] Conexão libertada."); }
  }
}