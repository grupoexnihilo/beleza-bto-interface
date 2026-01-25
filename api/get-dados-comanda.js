import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  const { unidadeId } = req.query;
  let client;

  try {
    client = await pool.connect();
    
    // Busca os colaboradores da sua unidade
    const profs = await client.query(
      'SELECT id_do_colaborador, nome FROM colaboradores WHERE empresa = $1 AND status = $2', 
      [unidadeId, 'Ativo']
    );
    
    // Busca os serviços que já têm o id_do_colaborador preenchido
    const servs = await client.query(
      'SELECT id_preco, nome_servico, valor_servico_sugerido, id_do_colaborador FROM tabela_de_precos WHERE unidade_id = $1', 
      [unidadeId]
    );

    res.status(200).json({ 
      profissionais: profs.rows, 
      servicos: servs.rows 
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (client) client.release();
  }
}