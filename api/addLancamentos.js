// Este é o ficheiro CORRIGIDO: /api/addLancamentos.js
import pkg from 'pg';
import { v4 as uuidv4 } from 'uuid';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

// --- VERIFIQUE SE ESTA LINHA ESTÁ EXATAMENTE ASSIM ---
export default async function handler(req, res) {
// ---------------------------------------------------
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const {
    unidadeId,
    emailOperador,
    dataCompetencia,
    dataPagamento,
    colaborador, // id_do_colaborador
    categoria,
    pagamentos, // { dinheiro: 50, pix: 100, ... }
  } = req.body;

  if (!unidadeId || !emailOperador || !dataCompetencia || !colaborador || !categoria) {
    return res.status(400).json({ message: 'Campos de cabeçalho obrigatórios.' });
  }

  let client; // Definido fora do try para poder ser usado no finally/catch
  try {
    client = await pool.connect();
    // Usamos uma Transação para garantir atomicidade
    await client.query('BEGIN');

    const query = `
      INSERT INTO lancamentos (
        id_de_lancamento, lancado_por, data_competencia, data_pagamento, valor_r,
        profissional, tipo_de_operacao, forma_de_pagamento, categoria, status, unidade
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;

    let lancamentosCriados = 0;

    // Itera sobre cada forma de pagamento enviada
    for (const forma in pagamentos) {
      const valor = parseFloat(pagamentos[forma]);

      // Só cria o lançamento se o valor for maior que zero
      if (valor > 0) {
        // Capitaliza a forma de pagamento para corresponder ao padrão (ex: "Pix", "Dinheiro")
        const formaPagamentoCapitalizada = forma.charAt(0).toUpperCase() + forma.slice(1);

        const valores = [
          uuidv4(),             // id_de_lancamento
          emailOperador,        // lancado_por
          dataCompetencia,      // data_competencia
          dataPagamento || dataCompetencia, // data_pagamento (usa competencia se não houver)
          valor,                // valor_r
          colaborador,          // profissional (id_do_colaborador)
          'Receita',            // tipo_de_operacao
          formaPagamentoCapitalizada, // forma_de_pagamento
          categoria,            // categoria
          'RECEBIDO',           // status
          unidadeId             // unidade
        ];

        await client.query(query, valores);
        lancamentosCriados++;
      }
    }

    // Finaliza a transação
    await client.query('COMMIT');

    if (lancamentosCriados === 0) {
      return res.status(400).json({ message: 'Nenhum valor válido foi inserido.' });
    }

    res.status(201).json({ message: `${lancamentosCriados} lançamento(s) de receita salvo(s) com sucesso!` });

  } catch (error) {
    // Se der erro, desfaz a transação
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Erro ao salvar receitas:', error);
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  } finally {
     // Garante que a conexão seja libertada
    if (client) {
      client.release();
    }
  }
}
// --- VERIFIQUE SE NÃO HÁ NADA DEPOIS DESTE FECHO '}' ---