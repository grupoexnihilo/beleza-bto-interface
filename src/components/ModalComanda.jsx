import React, { useState, useEffect } from 'react';
import './ModalComanda.css';

const ModalComanda = ({ agendamento, aoFechar, aoSalvar, profissionaisDisponiveis, produtosDisponiveis }) => {
  if (!agendamento) return null;

  // Estados para gerenciar as novas funções
  const [pago, setPago] = useState(agendamento.situacaoPagamento === 'Pago');
  const [formaPagamento, setFormaPagamento] = useState(agendamento.formaPagamento || '');
  const [servicosExtras, setServicosExtras] = useState([]);
  const [produtosExtras, setProdutosExtras] = useState([]);
  const [exibirAddServico, setExibirAddServico] = useState(false);
  const [exibirAddProduto, setExibirAddProduto] = useState(false);

  // Ajuste 3: Fechar com ESC
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') aoFechar(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [aoFechar]);

  // Ajuste 7: Filtra serviços baseados no profissional selecionado
  const servicosDoProfissional = profissionaisDisponiveis
    ?.find(p => p.nome === agendamento.profissional)?.servicos || [];

  return (
    <div className="modal-overlay" onClick={aoFechar}>
      <div className="ficha-detalhada-container" onClick={e => e.stopPropagation()}>
        
        {/* Ajuste 2: "X" no topo direito */}
        <button className="btn-close-x" onClick={aoFechar}>&times;</button>

        <div className="ficha-header">
          <div className="header-info">
            {/* Ajuste 1: Nome da tela no canto superior */}
            <span className="n-comanda-label">COMANDAS</span>
            <span className="n-comanda">ORDEM Nº {agendamento.comanda}</span>
            <h2>{agendamento.cliente}</h2>
            <span className="tel-cliente">{agendamento.telefone}</span>
          </div>
          
          {/* Ajuste 12: Situação do Pagamento (Switch Lateral) */}
          <div className="pagamento-switch-container">
            <label>Situação</label>
            <div className={`switch-track ${pago ? 'pago' : 'pendente'}`} onClick={() => setPago(!pago)}>
              <div className="switch-knob"></div>
              <span className="label-pendente">PENDENTE</span>
              <span className="label-pago">PAGO</span>
            </div>
          </div>
        </div>

        <div className="ficha-grid">
          <div className="ficha-col">
            <div className="info-group">
              <label>Data e Horário</label>
              <p className="p-destaque">{agendamento.data} - {agendamento.horario}</p>
            </div>

            {/* Ajuste 6 e 8: Serviço com quadro de preço lateral */}
            <div className="info-group">
              <label>Serviço</label>
              <div className="item-com-preco">
                <p>{agendamento.servico}</p>
                <div className="preco-tag">R$ {agendamento.valorServico?.toFixed(2)}</div>
              </div>
            </div>

            {/* Ajuste 4 e 5: Profissional abaixo do serviço */}
            <div className="info-group">
              <label>Profissional</label>
              <p>{agendamento.profissional}</p>
            </div>

            {/* Ajuste 7 e 11: Renderização de extras */}
            {servicosExtras.map((s, i) => (
              <div className="item-com-preco extra" key={i}>
                <p>{s.nome}</p>
                <div className="preco-tag small">R$ {s.preco.toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="ficha-col financeiro-card">
            {/* Ajuste 13: Forma de Pagamento (Botões coloridos) */}
            <div className="info-group">
              <label>Forma de Pagamento</label>
              <div className="pagamento-buttons">
                {['PIX', 'CARTÃO', 'DINHEIRO'].map(metodo => (
                  <button 
                    key={metodo}
                    className={`btn-metodo ${metodo.toLowerCase()} ${formaPagamento === metodo ? 'active' : ''}`}
                    onClick={() => setFormaPagamento(metodo)}
                  >
                    {metodo}
                  </button>
                ))}
              </div>
            </div>

            <div className="total-comanda-box">
              <label>TOTAL A RECEBER</label>
              <span className="valor-total">R$ {agendamento.valorServico?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="ficha-acoes-grid">
          {/* Ajuste 7: Botão Add Serviço */}
          <button className="btn-acao-outline" onClick={() => setExibirAddServico(!exibirAddServico)}>+ Serviço</button>
          
          {/* Ajuste 11: Botão Add Produto */}
          <button className="btn-acao-outline" onClick={() => setExibirAddProduto(!exibirAddProduto)}>+ Produto</button>
          
          {/* Ajuste 10: Reagendar */}
          <button className="btn-acao-outline" onClick={() => alert("Abrindo Calendário do Profissional...")}>📅 Reagendar</button>
          
          {/* Ajuste 9: Cancelar (Fecha sem salvar) */}
          <button className="btn-acao-danger" onClick={aoFechar}>✕ Cancelar</button>
        </div>

        {/* Ajuste 14: Salvar Comanda */}
        <button className="btn-fechar-comanda-full" onClick={() => aoSalvar({...agendamento, pago, formaPagamento})}>
          💾 SALVAR COMANDA E FINALIZAR
        </button>
      </div>
    </div>
  );
};

export default ModalComanda;