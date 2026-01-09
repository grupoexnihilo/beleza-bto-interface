import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import logoBelezaBTO from './assets/logo.png'; // Verifique se o caminho do seu logo está correto

// --- IMPORTAÇÃO DE MÓDULOS ---
import Agendamento from './modules/Agendamento';
import BaseClientes from './modules/BaseClientes';
import HistoricoLancamentos from './modules/HistoricoLancamentos';
import LoginForm from './modules/LoginForm';

// --- IMPORTAÇÃO DE COMPONENTES ---
import ModalComanda from './components/ModalComanda';
import CadastroClienteForm from './components/CadastroClienteForm';
import AdicionarDespesaForm from './components/AdicionarDespesaForm';
import EntradaRapidaForm from './components/EntradaRapidaForm';

function Dashboard({ user, unidadeId, unidades, onLogout }) {
  // --- ESTADOS DE NAVEGAÇÃO E INTERFACE ---
  const [telaAtiva, setTelaAtiva] = useState('resumo');
  const [menuExpandido, setMenuExpandido] = useState(false);
  const [filtroAberto, setFiltroAberto] = useState(false);

  // --- ESTADOS DE MODAIS E MENUS ---
  const [menuContexto, setMenuContexto] = useState({ visivel: false, x: 0, y: 0, agendamentoId: null });
  const [modalDetalhes, setModalDetalhes] = useState({ visivel: false, dados: null });

  // --- FONTE DE DADOS ---
  const [listaGlobalAgendamentos, setListaGlobalAgendamentos] = useState([
    { id: 1, data: new Date(), cliente: "David Emunaar", servico: "Corte Degradê", profissional: "Marcos Silva", status: "confirmado", comanda: "101", telefone: "(11) 99999-9999", valorServico: 50.00, situacaoPagamento: "Pendente" },
    { id: 2, data: new Date(new Date().setDate(new Date().getDate() + 1)), cliente: "João Pereira", servico: "Barba Terapia", profissional: "Felipe Araújo", status: "pendente", comanda: "102", telefone: "(11) 88888-8888", valorServico: 35.00, situacaoPagamento: "Pendente" }
  ]);

  // --- EFEITOS (TECLA ESC E CLIQUES FORA) ---
  useEffect(() => {
    const fecharTudo = (e) => {
      if (e.key === 'Escape') {
        setFiltroAberto(false);
        setMenuContexto({ ...menuContexto, visivel: false });
      }
    };
    window.addEventListener('keydown', fecharTudo);
    return () => window.removeEventListener('keydown', fecharTudo);
  }, [menuContexto]);

  // --- FUNÇÕES DE APOIO ---
  const formatarDataInteligente = (dataInput) => {
    const hoje = new Date();
    const data = new Date(dataInput);
    const diffDias = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24));

    const hora = `${data.getHours()}:${data.getMinutes().toString().padStart(2, '0')}`;
    if (diffDias === 0) return `Hoje às ${hora}`;
    if (diffDias === 1) return `Amanhã às ${hora}`;
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(data) + ` às ${hora}`;
  };

  const toggleMenu = () => setMenuExpandido(!menuExpandido);

  const selecionarTela = (tela) => {
    setTelaAtiva(tela);
    setMenuExpandido(false);
  };

  const excluirAgendamento = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este agendamento?")) {
      setListaGlobalAgendamentos(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleContextMenu = (e, id) => {
    e.preventDefault();
    setMenuContexto({ visivel: true, x: e.pageX, y: e.pageY, agendamentoId: id });
  };

  const unidadeAtual = unidades.find(u => u.id === unidadeId);
  const dataAtualFormatada = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date());

  const versiculoDoDia = {
    texto: "Tudo o que fizerem, façam de todo o coração, como para o Senhor",
    referencia: "Colossenses 3:23"
  };

  const renderConteudo = () => {
    switch (telaAtiva) {
      case 'resumo':
        return (
          <div className="resumo-dashboard">
            <div className="cards-grid">
              <div className="card-kpi-premium">
                <span className="card-label">Agendamentos Hoje</span>
                <strong className="card-value">{listaGlobalAgendamentos.length}</strong>
                <div className="card-decorator blue"></div>
              </div>
              <div className="card-kpi-premium">
                <span className="card-label">Faturamento (Dia)</span>
                <strong className="card-value">R$ 0,00</strong>
                <div className="card-decorator green"></div>
              </div>
              <div className="card-kpi-premium">
                <span className="card-label">Despesas (Dia)</span>
                <strong className="card-value" style={{ color: '#ef4444' }}>R$ 0,00</strong>
                <div className="card-decorator" style={{ background: '#ef4444' }}></div>
                </div>
              <div className="card-kpi-premium">
                <span className="card-label">Status do Caixa</span>
                <strong className="card-value" style={{ color: '#10b981' }}>ABERTO</strong>
                <div className="card-decorator"></div>
              </div>
            </div>

            <div className="dashboard-detalhes">
              <div className="painel-lista">
                <div className="header-lista-agendamentos">
                  <h4>Próximos Agendamentos</h4>
                  <div className="acoes-lista">
                    <div className="busca-box">
                      <input type="text" placeholder="Pesquisar..." />
                    </div>
                    <div className="dropdown-filtro-container">
                      <button 
                        className={`btn-filtro-icon ${filtroAberto ? 'active' : ''}`} 
                        onClick={() => setFiltroAberto(!filtroAberto)}
                      >
                        ⏳ Filtrar
                      </button>
                      {filtroAberto && (
                        <div className="filtro-dropdown">
                          <label><input type="checkbox" /> Por Data</label>
                          <label><input type="checkbox" /> Por Profissional</label>
                          <button className="btn-aplicar-filtro" onClick={() => setFiltroAberto(false)}>Aplicar</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="table-wrapper-fluido">
                  <table className="agenda-table">
                    <thead>
                      <tr>
                        <th>Horário</th>
                        <th>Cliente</th>
                        <th>Serviço</th>
                        <th>Profissional</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaGlobalAgendamentos.map((agendamento) => (
                        <tr 
                          key={agendamento.id} 
                          onContextMenu={(e) => handleContextMenu(e, agendamento.id)}
                          style={{ cursor: 'context-menu' }}
                        >
                          <td><strong className="data-destaque">{formatarDataInteligente(agendamento.data)}</strong></td>
                          <td>{agendamento.cliente}</td>
                          <td>{agendamento.servico}</td>
                          <td>{agendamento.profissional}</td>
                          <td>
                            <select 
                              className={`select-status-inline ${agendamento.status}`} 
                              value={agendamento.status}
                              onChange={(e) => {
                                const novoStatus = e.target.value;
                                setListaGlobalAgendamentos(prev => 
                                  prev.map(item => item.id === agendamento.id ? { ...item, status: novoStatus } : item)
                                );
                              }}
                            >
                              <option value="pendente">Pendente</option>
                              <option value="confirmado">Confirmado</option>
                              <option value="cancelado">Cancelado</option>
                              <option value="reagendado">Reagendado</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="painel-lista-acoes">
                <h4>Ações Rápidas</h4>
                <div className="painel-acoes-rapidas">
                  <button className="btn-atalho-fluido" onClick={() => setTelaAtiva('cadastros')}>+ Novo Cliente</button>
                  <button className="btn-atalho-fluido" onClick={() => setTelaAtiva('agendamentos')}>+ Novo Agendamento</button>
                  <button className="btn-atalho-fluido" onClick={() => setTelaAtiva('financeiro')}>+ Lançar Valor</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'clientes': return <BaseClientes unidadeId={unidadeId} onBack={() => setTelaAtiva('resumo')} />;
      case 'agendamentos': return <Agendamento />;
      case 'cadastros': return <CadastroClienteForm user={user} unidadeId={unidadeId} unidades={unidades} onBack={() => setTelaAtiva('resumo')} />;
      case 'financeiro':
        return (
          <div className="modulo-financeiro">
            <h3 style={{ marginBottom: '25px', color: '#0ea5e9' }}>Financeiro</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
              <EntradaRapidaForm user={user} unidadeId={unidadeId} onBack={() => setTelaAtiva('resumo')} />
              <AdicionarDespesaForm user={user} unidadeId={unidadeId} onBack={() => setTelaAtiva('resumo')} />
            </div>
            <HistoricoLancamentos user={user} unidadeId={unidadeId} />
          </div>
        );
      default: return <div>Módulo em desenvolvimento...</div>;
    }
  };

  return (
    <div className="dashboard-main-wrapper">
      <header className="navbar-superior">
        <div className="nav-top-row">
          <div className="nav-logo-area">
            <img src={logoBelezaBTO} alt="Logo" className="nav-logo-img" />
            <div className="versiculo-container">
              <span className="versiculo-texto">"{versiculoDoDia.texto}"</span>
              <span className="versiculo-ref">{versiculoDoDia.referencia}</span>
            </div>
          </div>
          
          <div className="nav-user-actions">
            <div className="user-info-group">
              <div className="user-greeting">
                <span>Olá, <strong>{user?.nome || 'Usuário'}</strong> 👋</span>
                <small>{unidadeAtual?.nome}</small>
              </div>
              <span className="data-header">{dataAtualFormatada.charAt(0).toUpperCase() + dataAtualFormatada.slice(1)}</span>
            </div>
            <button className="btn-sair-pill" onClick={onLogout}>Sair</button>
          </div>
        </div>

        {/* ESTRUTURA DO MENU COM ANIMAÇÃO LATERAL */}
        <nav className={`nav-bottom-row ${menuExpandido ? 'expandido' : 'recolhido'}`}>
          <button className="btn-menu-control" onClick={toggleMenu}>
            {menuExpandido ? '−' : '+'}
          </button>

          <div className="nav-scroll-wrapper">
            {[
              { id: 'resumo', label: '📊 Resumo' },
              { id: 'agendamentos', label: '📅 Agendamentos' },
              { id: 'clientes', label: '👥 Clientes' },
              { id: 'financeiro', label: '💰 Financeiro' },
              { id: 'servicos', label: '✂️ Serviços' },
              { id: 'cadastros', label: '📝 Cadastros' },
              { id: 'config', label: '⚙️ Configurações' }
            ].map((item) => (
              <button
                key={item.id}
                className={`nav-item-fluido ${telaAtiva === item.id ? 'active' : ''}`}
                onClick={() => selecionarTela(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="content-container-fixo">
        <section className="content-body-scroll">
          {renderConteudo()}
        </section>
      </main>

      {/* MENU DE CONTEXTO (CLIQUE DIREITO) */}
      {menuContexto.visivel && (
        <div 
          className="menu-contexto-agendamento" 
          style={{ 
            position: 'fixed', top: menuContexto.y, left: menuContexto.x,
            backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '8px',
            zIndex: 10000, padding: '5px', minWidth: '180px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column'
          }}
        >
          <button className="btn-contexto" onClick={() => {
            const agend = listaGlobalAgendamentos.find(a => a.id === menuContexto.agendamentoId);
            setModalDetalhes({ visivel: true, dados: agend });
            setMenuContexto({ ...menuContexto, visivel: false });
          }}>🔍 Ver Detalhes</button>
          
          <button className="btn-contexto delete" style={{ color: '#ef4444', textAlign: 'left', padding: '10px', background: 'none', border: 'none', cursor: 'pointer' }} 
            onClick={() => { excluirAgendamento(menuContexto.agendamentoId); setMenuContexto({ ...menuContexto, visivel: false }); }}>
            🗑️ Excluir Agendamento
          </button>
        </div>
      )}

      {/* MODAL DE DETALHES (COMANDA) */}
      {modalDetalhes.visivel && (
        <ModalComanda 
          agendamento={modalDetalhes.dados} 
          aoFechar={() => setModalDetalhes({ visivel: false, dados: null })}
          aoExcluir={excluirAgendamento}
          formatarData={formatarDataInteligente}
        />
      )}
    </div>
  );
}

export default Dashboard;