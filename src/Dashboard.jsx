import React, { useState, useEffect } from 'react'; // Adicionado useEffect aqui
import './Dashboard.css';

// Importações
import logoBelezaBTO from './logo-beleza-bto.png';
import BaseClientes from './BaseClientes';
import CadastroClienteForm from './CadastroClienteForm';
import EntradaRapidaForm from './EntradaRapidaForm';
import AdicionarDespesaForm from './AdicionarDespesaForm';
import HistoricoLancamentos from './HistoricoLancamentos';
import Agendamento from './Agendamento';

function Dashboard({ user, unidadeId, unidades, onLogout }) {
  // --- ESTADO PARA CONTROLAR O FILTRO ---
const [filtroAberto, setFiltroAberto] = useState(false);
useEffect(() => {
  const fecharComEsc = (e) => {
    if (e.key === 'Escape') {
      setFiltroAberto(false);
    }
  };

  if (filtroAberto) {
    window.addEventListener('keydown', fecharComEsc);
  }

  // Limpa o "ouvinte" quando o componente desmonta ou o filtro fecha
  return () => window.removeEventListener('keydown', fecharComEsc);
}, [filtroAberto]);

// --- FUNÇÃO PARA FORMATAÇÃO DE DATA INTELIGENTE ---
const formatarDataInteligente = (dataInput) => {
  const hoje = new Date();
  const data = new Date(dataInput);
  
  const diffTempo = data - hoje;
  const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

  if (diffDias === 0) return `Hoje às ${data.getHours()}:${data.getMinutes().toString().padStart(2, '0')}`;
  if (diffDias === 1) return `Amanhã às ${data.getHours()}:${data.getMinutes().toString().padStart(2, '0')}`;
  
  // Se for dentro da mesma semana (até 7 dias)
  if (diffDias > 1 && diffDias < 7) {
    const diaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(data);
    return `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)} às ${data.getHours()}:${data.getMinutes().toString().padStart(2, '0')}`;
  }

  // Se for mais de uma semana
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(data) + ` às ${data.getHours()}:${data.getMinutes().toString().padStart(2, '0')}`;
};
  const [telaAtiva, setTelaAtiva] = useState('resumo');
// --- ESTADOS PARA O MENU DE CONTEXTO (BOTÃO DIREITO) ---
const [menuContexto, setMenuContexto] = useState({ visivel: false, x: 0, y: 0, agendamentoId: null });

// Função para abrir o menu com o botão direito
const handleContextMenu = (e, id) => {
  e.preventDefault();
  setMenuContexto({
    visivel: true,
    x: e.pageX,
    y: e.pageY,
    agendamentoId: id
  });
};

// Efeito para fechar o menu ao clicar fora ou apertar ESC
useEffect(() => {
  const fecharMenu = () => setMenuContexto({ ...menuContexto, visivel: false });
  const fecharComEsc = (e) => { if (e.key === 'Escape') fecharMenu(); };

  if (menuContexto.visivel) {
    window.addEventListener('click', fecharMenu);
    window.addEventListener('keydown', fecharComEsc);
  }
  return () => {
    window.removeEventListener('click', fecharMenu);
    window.removeEventListener('keydown', fecharComEsc);
  };
}, [menuContexto.visivel]);
// --- FONTE DE DADOS ÚNICA (Temporária para sincronizar Resumo e Agenda) ---
const [listaGlobalAgendamentos, setListaGlobalAgendamentos] = useState([
  { id: 1, data: new Date(), cliente: "David Emunaar", servico: "Corte Degradê", profissional: "Marcos Silva", status: "confirmado" },
  { id: 2, data: new Date(new Date().setDate(new Date().getDate() + 1)), cliente: "João Pereira", servico: "Barba Terapia", profissional: "Felipe Araújo", status: "pendente" }
]);
  // --- TRECHO 1: NOVO ESTADO DO MENU ---
const [menuExpandido, setMenuExpandido] = useState(false);

const toggleMenu = () => setMenuExpandido(!menuExpandido);

// Função para mudar de tela e fechar o menu automaticamente
const selecionarTela = (tela) => {
  setTelaAtiva(tela);
  setMenuExpandido(false);
};
  const unidadeAtual = unidades.find(u => u.id === unidadeId);

  const renderConteudo = () => {
    switch (telaAtiva) {
      case 'resumo':
        return (
          <div className="resumo-dashboard">
            {/* 1 - CARDS DE RESUMO PROFISSIONAIS (CLASSES ATUALIZADAS) */}
            <div className="cards-grid">
              <div className="card-kpi-premium">
                <span className="card-label">Agendamentos Hoje</span>
                <strong className="card-value">0</strong>
                <div className="card-decorator"></div>
              </div>
              <div className="card-kpi-premium">
                <span className="card-label">Faturamento (Dia)</span>
                <strong className="card-value">R$ 0,00</strong>
                <div className="card-decorator blue"></div>
              </div>
              <div className="card-kpi-premium">
                <span className="card-label">Novos Clientes</span>
                <strong className="card-value">0</strong>
                <div className="card-decorator"></div>
              </div>
              <div className="card-kpi-premium">
                <span className="card-label">Status do Caixa</span>
                <strong className="card-value" style={{ color: '#10b981' }}>ABERTO</strong>
                <div className="card-decorator green"></div>
              </div>
            </div>
            
            <div className="dashboard-detalhes">
              {/* --- TRECHO: TABELA DE AGENDAMENTOS COM FILTROS --- */}
{/* --- TRECHO ATUALIZADO: TABELA COM DATA RELATIVA E FILTRO SUSPENSO --- */}
<div className="painel-lista">
<div className="header-lista-agendamentos">
  <h4>Próximos Agendamentos</h4>
  
  <div className="acoes-lista">
    <div className="busca-box">
      <input type="text" placeholder="Pesquisar..." />
    </div>

    <div className="dropdown-filtro-container">
      {/* Botão que agora alterna o estado */}
     {/* Localize este botão e substitua pela linha abaixo */}
<button 
  className={`btn-filtro-icon ${filtroAberto ? 'active' : ''}`} 
  onClick={() => setFiltroAberto(!filtroAberto)}
>
  <span className="icon-filtro">⏳</span> Filtrar
</button>
      
      {/* EXIBIÇÃO CONDICIONAL DO DROPDOWN */}
      {filtroAberto && (
        <div className="filtro-dropdown">
          <label><input type="checkbox" /> Por Data</label>
          <label><input type="checkbox" /> Por Profissional</label>
          <label><input type="checkbox" /> Por Cliente</label>
          <label><input type="checkbox" /> Por Status</label>
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
      {/* Exemplo no corpo da tabela usando a nova lógica */}
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
            // ATUALIZAÇÃO REATIVA DO ESTADO
            setListaGlobalAgendamentos(prev => 
              prev.map(item => 
                item.id === agendamento.id ? { ...item, status: novoStatus } : item
              )
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

              {/* 2 - BOTÕES DE AÇÃO RÁPIDA (CLASSES ATUALIZADAS) */}
              <div className="painel-lista-acoes">
                <h4>Ações Rápidas</h4>
                <div className="painel-acoes-rapidas">
                  <button className="btn-atalho-fluido" onClick={() => setTelaAtiva('cadastros')}>
                    + Novo Cliente
                  </button>
                  <button className="btn-atalho-fluido" onClick={() => setTelaAtiva('agendamentos')}>
                    + Novo Agendamento
                  </button>
                  <button className="btn-atalho-fluido" onClick={() => setTelaAtiva('financeiro')}>
                    + Lançar Valor
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'clientes':
        return <BaseClientes unidadeId={unidadeId} onBack={() => setTelaAtiva('resumo')} />;
        case 'agendamentos':
      return <Agendamento />;
      case 'cadastros':
        return <CadastroClienteForm user={user} unidadeId={unidadeId} unidades={unidades} onBack={() => setTelaAtiva('resumo')} />;
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
      default:
        return <div className="em-desenvolvimento"><h3>Módulo {telaAtiva.toUpperCase()}</h3><p>Em breve...</p></div>;
    }
  };
// --- TRECHO 1: LÓGICA DE DATA E VERSÍCULO ---
const dataAtual = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}).format(new Date());

// Exemplo de versículo (depois podemos conectar a uma API de versículos)
const versiculoDoDia = {
  texto: "Tudo o que fizerem, façam de todo o coração, como para o Senhor",
  referencia: "Colossenses 3:23"
};
  return (
    <div className="dashboard-main-wrapper">
{/* --- TRECHO 2: HEADER COM LOGO, VERSÍCULO E DATA --- */}
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
        <span className="data-header">{dataAtual.charAt(0).toUpperCase() + dataAtual.slice(1)}</span>
      </div>
      <button className="btn-sair-pill" onClick={onLogout}>Sair</button>
    </div>
  </div>

        {/* --- TRECHO 2: ESTRUTURA DO MENU DINÂMICO --- */}
<nav className={`nav-bottom-row ${menuExpandido ? 'expandido' : 'recolhido'}`}>
  
  {/* Botão de Controle (+ / -) */}
  <button className="btn-menu-control" onClick={toggleMenu}>
    {menuExpandido ? '−' : '+'}
  </button>

  <div className="nav-scroll-wrapper">
    {/* Lista de Botões */}
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
        className={`nav-item-fluido ${telaAtiva === item.id ? 'active' : ''} ${!menuExpandido && telaAtiva !== item.id ? 'hidden' : ''}`}
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
      {/* MENU DE CONTEXTO FLUTUANTE */}
      {menuContexto.visivel && (
        <div 
          className="menu-contexto-agendamento" 
          style={{ 
            position: 'fixed',
            top: menuContexto.y, 
            left: menuContexto.x,
            backgroundColor: '#18181b',
            border: '1px solid #333',
            borderRadius: '8px',
            zIndex: 10000,
            padding: '5px',
            minWidth: '180px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <button 
            style={{ 
              background: 'none', border: 'none', color: '#ccc', padding: '10px', 
              textAlign: 'left', cursor: 'pointer', borderRadius: '4px' 
            }}
            onClick={() => {
               alert('Ver Detalhes do ID: ' + menuContexto.agendamentoId);
               setMenuContexto({ ...menuContexto, visivel: false });
            }}
          >
            🔍 Ver Detalhes
          </button>
          
          <button 
            style={{ 
              background: 'none', border: 'none', color: '#ef4444', padding: '10px', 
              textAlign: 'left', cursor: 'pointer', borderRadius: '4px' 
            }}
            onClick={() => {
               alert('Excluir ID: ' + menuContexto.agendamentoId);
               setMenuContexto({ ...menuContexto, visivel: false });
            }}
          >
            🗑️ Excluir Agendamento
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;