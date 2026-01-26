import React, { useState, useEffect } from 'react';
import './ModalComanda.css';

const ModalComanda = ({ agendamento, aoFechar, aoExcluir, formatarData }) => {
    // ESTADOS
    const [numeroComanda, setNumeroComanda] = useState('...');
    const [profId, setProfId] = useState('');
    const [servicoId, setServicoId] = useState('');
    const [listaProfissionais, setListaProfissionais] = useState([]);
    const [listaServicos, setListaServicos] = useState([]);

    // 1. Busca número da comanda e dados (Profissionais/Serviços)
    useEffect(() => {
        if (agendamento) {
            // Busca Próximo Número
            fetch('/api/get-proxima-comanda?unidadeId=999')
                .then(res => res.json())
                .then(dados => {
                    if (dados.numero) setNumeroComanda(dados.numero.toString().padStart(4, '0'));
                })
                .catch(() => setNumeroComanda("ERRO"));

            // Busca Lista de Profissionais e Serviços
            fetch('/api/get-dados-comanda?unidadeId=999')
                .then(res => res.json())
                .then(data => {
                    setListaProfissionais(data.profissionais || []);
                    setListaServicos(data.servicos || []);
                })
                .catch(err => console.error("Erro ao carregar dados:", err));
        }
    }, [agendamento]);

    // 2. Tecla ESC para fechar
    useEffect(() => {
        const handleEsc = (event) => { if (event.key === 'Escape') aoFechar(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [aoFechar]);

    if (!agendamento) return null;

    // Cálculo do Preço Atual
    const servicoAtual = listaServicos.find(s => s.id_preco === servicoId);

    return (
        <div className="modal-overlay" onClick={aoFechar}>
            <div className="ficha-detalhada-container" onClick={e => e.stopPropagation()}>
                
                <button className="btn-close-x" onClick={aoFechar}>&times;</button>

                <div className="ficha-header">
                    <div className="header-info">
                        <span className="nome-tela-superior">SISTEMA DE COMANDAS</span>
                        <span className="n-comanda">ORDEM Nº {numeroComanda}</span>
                        <h2>{agendamento.cliente}</h2>
                        <span className="tel-cliente">{agendamento.telefone}</span>
                    </div>

                    <div className={`status-badge-ficha ${agendamento.status || 'pendente'}`}>
                        {(agendamento.status || 'PENDENTE').toUpperCase()}
                    </div>
                </div>

                <div className="ficha-grid">
                    {/* COLUNA DA ESQUERDA: DETALHES */}
                    <div className="ficha-col main-info">
                        <div className="info-group">
                            <label>Data e Horário</label>
                            <p className="p-destaque">{formatarData(agendamento.data)}</p>
                        </div>

                        <div className="info-group">
                            <label>Profissional Responsável</label>
                            <select 
                                className="select-elite" 
                                value={profId} 
                                onChange={(e) => { setProfId(e.target.value); setServicoId(''); }}
                            >
                                <option value="">Selecione o profissional...</option>
                                {listaProfissionais.map(p => (
                                    <option key={p.id_do_colaborador} value={p.id_do_colaborador}>{p.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div className="info-group">
                            <label>Serviço Principal</label>
                            <div className="row-item-select">
                                <select 
                                    className="select-elite"
                                    value={servicoId}
                                    onChange={(e) => setServicoId(e.target.value)}
                                    disabled={!profId}
                                >
                                    <option value="">{profId ? "Selecione o serviço..." : "Escolha um profissional primeiro"}</option>
                                    {listaServicos
                                        .filter(s => s.id_do_colaborador === profId)
                                        .map(s => <option key={s.id_preco} value={s.id_preco}>{s.nome_servico}</option>)
                                    }
                                </select>
                                <div className="quadro-preco">
                                    <small>R$</small>
                                    <span>{servicoAtual?.valor_servico_sugerido || '0,00'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLUNA DA DIREITA: FINANCEIRO */}
                    <div className="ficha-col financeiro-card">
                        <div className="info-group">
                            <label>Situação do Pagamento</label>
                            <p className={`status-pag ${agendamento.situacaoPagamento === 'Pago' ? 'text-verde' : 'text-amarelo'}`}>
                                {agendamento.situacaoPagamento || 'Pendente'}
                            </p>
                        </div>
                        <div className="info-group">
                            <label>Forma de Pagamento</label>
                            <p>{agendamento.formaPagamento || 'A definir no fechamento'}</p>
                        </div>
                        
                        <div className="total-comanda-box">
                            <label>TOTAL A PAGAR</label>
                            <span className="valor-total">
                                R$ {servicoAtual?.valor_servico_sugerido || '0,00'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="ficha-acoes-container">
                    <div className="botoes-secundarios">
                        <button className="btn-acao-outline">+ Serviço</button>
                        <button className="btn-acao-outline">+ Produto</button>
                        <button className="btn-acao-outline">📅 Reagendar</button>
                    </div>
                    <button className="btn-acao-danger" onClick={aoFechar}>✕ Cancelar</button>
                </div>

                <button className="btn-fechar-comanda-full" onClick={aoFechar}>
                    ⚡ SALVAR COMANDA E FINALIZAR ATENDIMENTO
                </button>
            </div>
        </div>
    );
};

export default ModalComanda;