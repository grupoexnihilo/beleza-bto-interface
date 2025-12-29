import React from 'react';
import './ModalComanda.css';

const ModalComanda = ({ agendamento, aoFechar, aoExcluir, formatarData }) => {
  if (!agendamento) return null;

  return (
    <div className="modal-overlay" onClick={aoFechar}>
      <div className="ficha-detalhada-container" onClick={e => e.stopPropagation()}>
        
        <div className="ficha-header">
          <div className="header-info">
            <span className="n-comanda">COMANDA Nº {agendamento.comanda || '---'}</span>
            <h2>{agendamento.cliente}</h2>
            <span className="tel-cliente">{agendamento.telefone}</span>
          </div>
          <div className={`status-badge-ficha ${agendamento.status}`}>
            {agendamento.status.toUpperCase()}
          </div>
        </div>

        <div className="ficha-grid">
          <div className="ficha-col">
            <div className="info-group">
              <label>Data e Horário</label>
              <p>{formatarData(agendamento.data)}</p>
            </div>
            <div className="info-group">
              <label>Profissional Responsável</label>
              <p>{agendamento.profissional}</p>
            </div>
            <div className="info-group">
              <label>Serviço Principal</label>
              <p>{agendamento.servico} - <strong>R$ {agendamento.valorServico?.toFixed(2)}</strong></p>
            </div>
          </div>

          <div className="ficha-col financeiro-card">
            <div className="info-group">
              <label>Situação do Pagamento</label>
              <p className={agendamento.situacaoPagamento === 'Pago' ? 'text-verde' : 'text-amarelo'}>
                {agendamento.situacaoPagamento}
              </p>
            </div>
            <div className="info-group">
              <label>Forma de Pagamento</label>
              <p>{agendamento.formaPagamento || 'A definir'}</p>
            </div>
            <div className="total-comanda-box">
              <label>VALOR TOTAL DA COMANDA</label>
              <span className="valor-total">R$ {agendamento.valorServico?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="ficha-acoes-grid">
          <button className="btn-acao-outline">+ Serviço</button>
          <button className="btn-acao-outline">+ Produto</button>
          <button className="btn-acao-outline">📅 Reagendar</button>
          <button className="btn-acao-danger" onClick={() => aoExcluir(agendamento.id)}>✕ Cancelar</button>
        </div>

        <button className="btn-fechar-comanda-full" onClick={aoFechar}>
          ⚡ FECHAR COMANDA E FINALIZAR
        </button>
      </div>
    </div>
  );
};

export default ModalComanda;