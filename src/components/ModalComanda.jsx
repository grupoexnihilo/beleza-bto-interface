import React, { useState, useEffect } from 'react';
import './ModalComanda.css';

const [profId, setProfId] = useState('');
const [servicoId, setServicoId] = useState('');

const ModalComanda = ({ agendamento, aoFechar, aoExcluir, formatarData }) => {
  // Estado para armazenar o número da comanda vindo do banco
  const [numeroComanda, setNumeroComanda] = useState('...');

  // AJUSTE 15: Busca o próximo número assim que o modal abre
  useEffect(() => {
    if (agendamento) {
      // Faz a chamada para sua API de contagem
      fetch('/api/get-proxima-comanda?unidadeId=999')
        .then(res => res.json())
        .then(dados => {
          if (dados.numero) {
            // Formata o número (ex: 1 vira 0001)
            setNumeroComanda(dados.numero.toString().padStart(4, '0'));
          }
        })
        .catch(err => {
          console.error("Erro ao buscar número:", err);
          setNumeroComanda("ERRO");
        });
    }
  }, [agendamento]);

  // AJUSTE 3: Fechar com a tecla ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') aoFechar();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [aoFechar]);

  if (!agendamento) return null;

  return (
    <div className="modal-overlay" onClick={aoFechar}>
      <div className="ficha-detalhada-container" onClick={e => e.stopPropagation()}>
        
        {/* AJUSTE 2: Botão X no topo superior direito */}
        <button className="btn-close-x" onClick={aoFechar}>&times;</button>

        <div className="ficha-header">
          <div className="header-info">
            {/* AJUSTE 1: Título da tela no canto superior esquerdo */}
            <span className="nome-tela-superior">COMANDAS</span>
            
            {/* AJUSTE 15: Exibindo o número automático */}
            <span className="n-comanda">ORDEM Nº {numeroComanda}</span>
            
            <h2>{agendamento.cliente}</h2>
            <span className="tel-cliente">{agendamento.telefone}</span>
          </div>

          {/* Badge de Status com proteção para não vir vazio */}
          <div className={`status-badge-ficha ${agendamento.status || 'pendente'}`}>
            {(agendamento.status || 'PENDENTE').toUpperCase()}
          </div>
        </div>

        <div className="ficha-grid">
          <div className="ficha-col">
            <div className="info-group">
              <label>Data e Horário</label>
              <p>{formatarData(agendamento.data)}</p>
            </div>

            {/* AJUSTE 6: Nome simplificado para "Serviço" */}
            <div className="info-group">
  <label>Serviço</label>
  <div className="row-item-select">
    <select 
      className="select-elite"
      value={servicoId}
      onChange={(e) => setServicoId(e.target.value)}
      disabled={!profId} // Bloqueia se não escolher o profissional antes
    >
      <option value="">{profId ? "Selecione o serviço..." : "Escolha um profissional primeiro"}</option>
      {listaServicos
        .filter(s => s.id_do_colaborador === profId) // AQUI ACONTECE O AJUSTE 7
        .map(s => <option key={s.id_preco} value={s.id_preco}>{s.nome_servico}</option>)
      }
    </select>

    {/* --- AQUI ENTRA O AJUSTE 8 --- */}
    <div className="quadro-preco">
      <small>R$</small>
      <span>
        {listaServicos.find(s => s.id_preco === servicoId)?.valor_servico_sugerido || '0,00'}
      </span>
    </div>
    {/* ---------------------------- */}
    </div>
    </div>
    

            {/* AJUSTE 4 e 5: Profissional abaixo do serviço e nome simplificado */}
           <div className="info-group">
  <label>Profissional</label>
  <select 
    className="select-elite" 
    value={profId} 
    onChange={(e) => {
      setProfId(e.target.value);
      setServicoId(''); // Reseta o serviço se mudar o profissional
    }}
  >
    <option value="">Selecione o profissional...</option>
    {listaProfissionais.map(p => (
      <option key={p.id_do_colaborador} value={p.id_do_colaborador}>{p.nome}</option>
    ))}
  </select>
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
  <span className="valor-total">
    R$ {listaServicos.find(s => s.id_preco === servicoId)?.valor_servico_sugerido || '0,00'}
  </span>
</div>
          </div>
        </div>

        <div className="ficha-acoes-grid">
          <button className="btn-acao-outline">+ Serviço</button>
          <button className="btn-acao-outline">+ Produto</button>
          <button className="btn-acao-outline">📅 Reagendar</button>
          
          {/* AJUSTE 9: Função cancelar apenas fecha o modal */}
          <button className="btn-acao-danger" onClick={aoFechar}>✕ Cancelar</button>
        </div>

        <button className="btn-fechar-comanda-full" onClick={aoFechar}>
          ⚡ SALVAR COMANDA E FINALIZAR
        </button>
      </div>
    </div>
  );
};

export default ModalComanda;