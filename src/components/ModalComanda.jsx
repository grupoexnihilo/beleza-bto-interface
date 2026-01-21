import React, { useState, useEffect } from 'react';
import './ModalComanda.css';

const ModalComanda = ({ agendamento, aoFechar, aoSalvar, profissionais, produtos }) => {
  if (!agendamento) return null;

  // Estados para gerenciar a lógica de edição e os 15 ajustes
  const [pago, setPago] = useState(agendamento.situacaoPagamento === 'Pago');
  const [formaPagamento, setFormaPagamento] = useState(agendamento.formaPagamento || '');
  const [profissionalId, setProfissionalId] = useState('');
  const [servicoSelecionado, setServicoSelecionado] = useState('');

  // Ajuste 3: Fechar com ESC
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') aoFechar(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [aoFechar]);

  // Ajuste 7: Filtro de serviços condicional ao profissional
  const servicosDisponiveis = profissionais?.find(p => p.nome === profissionalId)?.servicos || [];

  return (
    <div className="modal-overlay" onClick={aoFechar}>
      <div className="ficha-detalhada-container" onClick={e => e.stopPropagation()}>
        
        {/* Ajuste 2: "X" no topo direito */}
        <button className="btn-close-topo" onClick={aoFechar}>&times;</button>

        <div className="ficha-header">
          <div className="header-info">
            {/* Ajuste 1: Título da tela */}
            <span className="label-topo-tela">COMANDAS</span>
            <span className="n-comanda">ORDEM Nº {agendamento.comanda || '0001'}</span>
            <h2>{agendamento.cliente}</h2>
            <span className="tel-cliente">{agendamento.telefone}</span>
          </div>

          {/* Ajuste 12: Situação do pagamento em Chave Lateral */}
          <div className="pagamento-situacao-box">
             <label>SITUAÇÃO</label>
             <div className={`chave-pagamento-track ${pago ? 'pago' : 'pendente'}`} onClick={() => setPago(!pago)}>
                <div className="chave-knob"></div>
                <span className="txt-pendente">PENDENTE</span>
                <span className="txt-pago">PAGO</span>
             </div>
          </div>
        </div>

        <div className="ficha-grid">
          <div className="ficha-col">
            <div className="info-group">
              <label>Data e Horário</label>
              <p className="txt-destaque">{agendamento.data} - {agendamento.horario}</p>
            </div>

            {/* Ajuste 6 e 8: Serviço com quadro de preço lateral */}
            <div className="info-group">
              <label>Serviço</label>
              <div className="row-item-select">
                <select 
                  className="select-elite"
                  value={servicoSelecionado}
                  onChange={(e) => setServicoSelecionado(e.target.value)}
                >
                  <option value="">Selecione o serviço...</option>
                  {servicosDisponiveis.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="quadro-preco">R$ {agendamento.valorServico?.toFixed(2) || '0,00'}</div>
              </div>
            </div>

            {/* Ajuste 4 e 5: Profissional abaixo do serviço */}
            <div className="info-group">
              <label>Profissional</label>
              <select 
                className="select-elite"
                value={profissionalId}
                onChange={(e) => setProfissionalId(e.target.value)}
              >
                <option value="">Selecione o profissional...</option>
                {profissionais?.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
              </select>
            </div>
          </div>

          <div className="ficha-col financeiro-card">
            {/* Ajuste 13: Forma de pagamento botões coloridos */}
            <div className="info-group">
              <label>Forma de Pagamento</label>
              <div className="btn-group-pagamento">
                <button className={`btn-pg pix ${formaPagamento === 'PIX' ? 'active' : ''}`} onClick={() => setFormaPagamento('PIX')}>PIX</button>
                <button className={`btn-pg card ${formaPagamento === 'CARTAO' ? 'active' : ''}`} onClick={() => setFormaPagamento('CARTAO')}>CARTÃO</button>
                <button className={`btn-pg cash ${formaPagamento === 'DINHEIRO' ? 'active' : ''}`} onClick={() => setFormaPagamento('DINHEIRO')}>DINHEIRO</button>
              </div>
            </div>

            <div className="total-comanda-box">
              <label>VALOR TOTAL DA COMANDA</label>
              <span className="valor-total">R$ {agendamento.valorServico?.toFixed(2) || '0,00'}</span>
            </div>
          </div>
        </div>

        <div className="ficha-acoes-grid">
          {/* Ajuste 7 e 11: Dropdowns extras seriam acionados aqui */}
          <button className="btn-acao-outline">+ Serviço</button>
          <button className="btn-acao-outline">+ Produto</button>
          
          {/* Ajuste 10: Reagendar */}
          <button className="btn-acao-outline" onClick={() => alert("Abrindo Calendário...")}>📅 Reagendar</button>
          
          {/* Ajuste 9: Cancelar (Fecha sem salvar) */}
          <button className="btn-acao-danger" onClick={aoFechar}>✕ Cancelar</button>
        </div>

        {/* Ajuste 14: Salvar e Enviar */}
        <button className="btn-fechar-comanda-full" onClick={() => aoSalvar({...agendamento, pago, formaPagamento})}>
          💾 SALVAR COMANDA E FINALIZAR
        </button>
      </div>
    </div>
  );
};

export default ModalComanda;