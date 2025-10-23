// --- V.FINAL + GRUPO + DEBUG LOGS (Despesas) ---
console.log("[1] ADD_LANCAMENTO: Ficheiro carregado."); // LOG #1

import pkg from 'pg';
import { v4 as uuidv4 } from 'uuid';
const { Pool } = pkg;

console.log("[2] ADD_LANCAMENTO: Módulos importados."); // LOG #2

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

console.log("[3] ADD_LANCAMENTO: Pool de ligação criado."); // LOG #3

export default async function handler(req, res) {
  console.log("[4] ADD_LANCAMENTO: Função handler iniciada."); // LOG #4

  if (req.method !== 'POST') {
    console.log("[INFO] ADD_LANCAMENTO: Método não permitido:", req.method);
    return res.status(405).json({ message: 'Método não permitido' });
  }

  console.log("[INFO] ADD_LANCAMENTO: Corpo da requisição recebido:", req.body); // LOG #5
  const {
    unidadeId, emailOperador, dataCompetencia, dataPagamento,
    categoria, formaPagamento, descricao, valor,
  } = req.body;

  if (!unidadeId || !emailOperador || !dataCompetencia || !categoria || !valor) {
    console.log("[WARN] ADD_LANCAMENTO: Campos obrigatórios em falta.");
    return res.status(400).json({ message: 'Campos obrigatórios em falta.' });
  }

  let client;
  try {
    console.log("[6] ADD_LANCAMENTO: Dentro do bloco try."); // LOG #6
    client = await pool.connect();
    console.log("[7] ADD_LANCAMENTO: Ligado ao banco de dados."); // LOG #7

    console.log("[INFO] ADD_LANCAMENTO: Buscando grupo para categoria:", categoria);
    const grupoQuery = 'SELECT grupo FROM dados WHERE categoria = $1 LIMIT 1';
    const grupoResult = await client.query(grupoQuery, [categoria]);
    const grupo = grupoResult.rows.length > 0 ? grupoResult.rows[0].grupo : null;
    console.log("[INFO] ADD_LANCAMENTO: Grupo encontrado:", grupo); // LOG #8

    const insertQuery = `
      INSERT INTO lancamentos (
        id_de_lancamento, lancado_por, data_competencia, data_pagamento, valor_r,
        tipo_de_operacao, forma_de_pagamento, grupo, categoria,
        descricao, status, unidade
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;

    const valores = [
      uuidv4(), emailOperador, dataCompetencia, dataPagamento || dataCompetencia,
      parseFloat(valor), 'Despesa', formaPagamento,
      grupo, categoria, descricao, 'PAGO', unidadeId
    ];
    console.log("[INFO] ADD_LANCAMENTO: Preparando para inserir valores:", valores); // LOG #9

    await client.query(insertQuery, valores);
    console.log("[SUCCESS] ADD_LANCAMENTO: Inserção concluída."); // LOG #10

    res.status(201).json({ message: 'Despesa salva com sucesso!' });

  } catch (error) {
    console.error("[ERROR] ADD_LANCAMENTO: Erro capturado:", error); // LOG #11
    res.status(500).json({ message: 'Erro interno do servidor ao salvar despesa.', error: error.message });
  } finally {
    console.log("[12] ADD_LANCAMENTO: Dentro do bloco finally."); // LOG #12
    if (client) {
      client.release();
      console.log("[INFO] ADD_LANCAMENTO: Ligação libertada.");
    }
  }
}