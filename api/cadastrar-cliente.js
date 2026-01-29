import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido' });

  // Pegamos a unidade diretamente do corpo da requisição enviada pelo Front-end
  const { 
    id, nome, whatsapp, unidade, cadastrado_por 
  } = req.body;

  // VALIDAÇÃO CRÍTICA: Se a unidade não vier ou estiver com o texto de erro, bloqueamos
  if (!unidade || unidade === "Carregando unidade...") {
    return res.status(400).json({ 
      message: 'Erro: A unidade não foi identificada. Verifique o login do usuário.' 
    });
  }

  let client;

  try {
    client = await pool.connect();
    
    // O INSERT agora usa a variável 'unidade' que veio do usuário logado
    const query = `
      INSERT INTO clientes (id, nome, whatsapp, unidade, cadastrado_por, data_cadastro)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `;
    
    await client.query(query, [id, nome, whatsapp, unidade, cadastrado_por]);

    res.status(201).json({ message: 'Cliente vinculado à unidade ' + unidade + ' com sucesso!' });
  } catch (error) {
    console.error('[ERRO NO CADASTRO]:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) client.release();
  }
}