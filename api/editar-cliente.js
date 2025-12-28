import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Método não permitido' });

  const { id, ...dados } = req.body;

  try {
    const client = await pool.connect();
    const query = `
      UPDATE clientes SET 
        nome=$1, whatsapp=$2, email=$3, cpf=$4, cep=$5, endereco=$6, 
        numero=$7, complemento=$8, bairro=$9, cidade=$10, estado=$11, 
        atividade=$12, data_nascimento=$13, data_cadastro=$14
      WHERE id=$15
    `;
    const valores = [
      dados.nome, dados.whatsapp, dados.email, dados.cpf, dados.cep, dados.endereco,
      dados.numero, dados.complemento, dados.bairro, dados.cidade, dados.estado,
      dados.atividade, dados.data_nascimento, dados.data_cadastro, id
    ];

    await client.query(query, valores);
    client.release();
    res.status(200).json({ message: 'Dados atualizados!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}