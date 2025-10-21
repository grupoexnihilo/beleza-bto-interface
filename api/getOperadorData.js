// Este é o arquivo: /api/getOperadorData.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email do operador é obrigatório' });
  }

  try {
    const client = await pool.connect();

    // 2. A QUERY CORRETA (Baseada no seu Dicionário de Dados)
    const query = `
      SELECT 
          t_colab.nome, 
          t_empresa.unidade AS id_unidade,        -- ID da empresa vindo da tabela 'cadastro_da_empresa'
          t_empresa.empresa AS nome_unidade     -- Nome "Rótulo" da empresa
      FROM 
          colaboradores AS t_colab
      JOIN 
          cadastro_da_empresa AS t_empresa ON t_colab.empresa = t_empresa.unidade 
      WHERE 
          t_colab.email = $1;
    `;
    
    const result = await client.query(query, [email]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(200).json({ nome: email, unidades: [] });
    }

    // 3. Formatar os dados
    const nomeColaborador = result.rows[0].nome;

    const unidades = result.rows.map(row => ({
      id: row.id_unidade,    // Ex: "unidade_1"
      nome: row.nome_unidade  // Ex: "Barbearia Matriz - Centro"
    }));

    // 4. Retornar os dados
    return res.status(200).json({
      nome: nomeColaborador,
      unidades: unidades 
    });

  } catch (error)
    {
    console.error('Erro ao buscar dados do operador:', error);
    return res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
}