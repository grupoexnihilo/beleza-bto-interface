import React, { useState } from 'react';
import './Caixa.css';

function Caixa({ unidadeId, onBack }) {
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [valorInput, setValorInput] = useState("0,00");

  // Estados fictícios para o Layout
  const [dadosCaixa, setDadosCaixa] = useState({
    valorAbertura: 0,
    receitas: 450.00,
    despesas: 120.00,
    historico: [
      { id: 1, tipo: 'RECEITA', descricao: 'Comanda #102 - João Silva', valor: 150.00, hora: '10:30' },
      { id: 2, tipo: 'DESPESA', descricao: 'Compra Material Limpeza', valor: 50.00, hora: '11:15' },
      { id: 3, tipo: 'RECEITA', descricao: 'Comanda #103 - Maria Oliveira', valor: 300.00, hora: '14:00' },
      { id: 4, tipo: 'DESPESA', descricao: 'Reposição de estoque', valor: 70.00, hora: '15:20' },
    ]
  });

  const saldoAtual = (dadosCaixa.valorAbertura + dadosCaixa.receitas) - dadosCaixa.despesas;

  // Função para formatar moeda em tempo real
  const formatarMoedaInput = (valor) => {
     // Remove tudo que não é dígito
     const apenasNumeros = valor.replace(/\D/g, "");
    
     // Converte para centavos
       const options = { minimumFractionDigits: 2 };
    const resultado = Intl.NumberFormat("pt-BR", options).format(
      parseFloat(apenasNumeros) / 100
    );

    return resultado === "NaN" ? "0,00" : resultado;
  };

  return (
    <div className="caixa-container">
      <div className="header-base">
        <button onClick={onBack} className="back-button">← Voltar</button>
        <h2 style={{ color: 'white' }}>Gestão de Caixa</h2>
        <div className="header-status">
            <span className={`status-badge ${caixaAberto ? 'aberto' : 'fechado'}`}>
                {caixaAberto ? '● Caixa Aberto' : '○ Caixa Fechado'}
            </span>
        </div>
      </div>

      {!caixaAberto ? (
        /* TELA DE ABERTURA */
        <div className="abertura-caixa-card">
          <h3>Abrir Novo Caixa</h3>
          <p>Defina o valor em dinheiro disponível para iniciar o dia.</p>
          <div className="form-group">
            <label>Valor de Abertura (R$)</label>
            <input 
    type="text" 
    placeholder="0,00" 
    value={valorInput}
    onChange={(e) => setValorInput(formatarMoedaInput(e.target.value))}
    style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}
  />
          </div>
          <button className="btn-abrir" onClick={() => setCaixaAberto(true)}>Confirmar Abertura</button>
        </div>
      ) : (
        /* TELA DE FLUXO ATIVO */
        <>
          <div className="caixa-resumo-grid">
            <div className="resumo-card">
              <span>Abertura</span>
              <p>R$ {dadosCaixa.valorAbertura.toFixed(2)}</p>
            </div>
            <div className="resumo-card receita">
              <span>Receitas (+)</span>
              <p>R$ {dadosCaixa.receitas.toFixed(2)}</p>
            </div>
            <div className="resumo-card despesa">
              <span>Despesas (-)</span>
              <p>R$ {dadosCaixa.despesas.toFixed(2)}</p>
            </div>
            <div className="resumo-card saldo">
              <span>Caixa Atual</span>
              <p>R$ {saldoAtual.toFixed(2)}</p>
            </div>
          </div>

          <div className="caixa-acoes">
             <button className="btn-fechar" onClick={() => setCaixaAberto(false)}>Encerrar Caixa</button>
          </div>

          <div className="table-wrapper">
            <h4 className="table-title">Histórico de Movimentações</h4>
            <table className="clientes-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th style={{textAlign: 'right'}}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {dadosCaixa.historico.map(item => (
                  <tr key={item.id}>
                    <td style={{color: '#888'}}>{item.hora}</td>
                    <td>{item.descricao}</td>
                    <td>
                        <span className={`badge-tipo ${item.tipo.toLowerCase()}`}>
                            {item.tipo}
                        </span>
                    </td>
                    <td style={{textAlign: 'right', fontWeight: 'bold'}}>
                        {item.tipo === 'RECEITA' ? '+ ' : '- '} R$ {item.valor.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Caixa;