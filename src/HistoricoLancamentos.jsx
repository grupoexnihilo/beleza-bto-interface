import React from 'react';
import './HistoricoLancamentos.css';

// --- DADOS DE EXEMPLO (VIRÃO DO NEON NO FUTURO) ---
// Usaremos estes dados para construir a interface visualmente.
const lancamentosExemplo = [
  { id: 1, data: '05/10/2025', descricao: 'Venda de produto A', receita: 1200.50, despesa: 0 },
  { id: 2, data: '05/10/2025', descricao: 'Pagamento de aluguel', receita: 0, despesa: 800.00 },
  { id: 3, data: '04/10/2025', descricao: 'Serviço de consultoria', receita: 2500.00, despesa: 0 },
  { id: 4, data: '04/10/2025', descricao: 'Compra de material de escritório', receita: 0, despesa: 150.75 },
  { id: 5, data: '03/10/2025', descricao: 'Venda de produto B', receita: 450.00, despesa: 0 },
];

function HistoricoLancamentos() {
  // No futuro, receberemos os lançamentos via props: function HistoricoLancamentos({ lancamentos })
  const lancamentos = lancamentosExemplo; // Por agora, usamos os dados de exemplo

  const totalReceitas = lancamentos.reduce((acc, item) => acc + item.receita, 0);
  const totalDespesas = lancamentos.reduce((acc, item) => acc + item.despesa, 0);
  const saldoTotal = totalReceitas - totalDespesas;

  const formatarValor = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="historico-wrapper">
      <h2>Histórico de Lançamentos</h2>
      <table className="tabela-lancamentos">
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Receita</th>
            <th>Despesa</th>
          </tr>
        </thead>
        <tbody>
          {lancamentos.map(item => (
            <tr key={item.id}>
              <td>{item.data}</td>
              <td>{item.descricao}</td>
              <td className="valor-receita">{item.receita > 0 ? formatarValor(item.receita) : '-'}</td>
              <td className="valor-despesa">{item.despesa > 0 ? formatarValor(item.despesa) : '-'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="2"><strong>Total Receitas:</strong></td>
            <td className="valor-receita">{formatarValor(totalReceitas)}</td>
            <td></td>
          </tr>
          <tr>
            <td colSpan="2"><strong>Total Despesas:</strong></td>
            <td></td>
            <td className="valor-despesa">{formatarValor(totalDespesas)}</td>
          </tr>
          <tr>
            <td colSpan="2"><strong>Saldo Total:</strong></td>
            <td colSpan="2" className="total-geral">{formatarValor(saldoTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default HistoricoLancamentos;
