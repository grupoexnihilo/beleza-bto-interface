import React, { useState } from 'react';
import './Dashboard.css';

// Importações
import logoBelezaBTO from './logo-beleza-bto.png';
import BaseClientes from './BaseClientes';
import CadastroClienteForm from './CadastroClienteForm';
import EntradaRapidaForm from './EntradaRapidaForm';
import AdicionarDespesaForm from './AdicionarDespesaForm';
import HistoricoLancamentos from './HistoricoLancamentos';

function Dashboard({ user, unidadeId, unidades, onLogout }) {
  // --- ESTADO PARA CONTROLAR O FILTRO ---
const [filtroAberto, setFiltroAberto] = useState(false);

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
      <button className="btn-filtro-icon" onClick={() => setFiltroAberto(!filtroAberto)}>
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
  <tr>
    <td><strong className="data-destaque">{formatarDataInteligente(new Date())}</strong></td>
    <td>David Emunaar</td>
    <td>Corte Degradê</td>
    <td>Marcos Silva</td>
    <td><span className="status-badge verde">Confirmado</span></td>
  </tr>
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
    </div>
  );
}

export default Dashboard;