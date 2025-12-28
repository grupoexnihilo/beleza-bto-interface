import React, { useState } from 'react';
import './Dashboard.css';

// Importando seus componentes existentes
import BaseClientes from './BaseClientes';
import CadastroClienteForm from './CadastroClienteForm';
import EntradaRapidaForm from './EntradaRapidaForm';
import AdicionarDespesaForm from './AdicionarDespesaForm';
import HistoricoLancamentos from './HistoricoLancamentos';

function Dashboard({ user, unidadeId, unidades, onLogout }) {
  const [menuAberto, setMenuAberto] = useState(true);
  const [telaAtiva, setTelaAtiva] = useState('resumo');

  const unidadeAtual = unidades.find(u => u.id === unidadeId);

  // --- RENDERIZAÇÃO DE CONTEÚDO ---
  const renderConteudo = () => {
    switch (telaAtiva) {
      case 'resumo':
        return (
          <div className="resumo-dashboard">
            <div className="cards-grid">
              <div className="card-kpi"><span>Agendamentos Hoje</span><strong>0</strong></div>
              <div className="card-kpi"><span>Faturamento (Dia)</span><strong>R$ 0,00</strong></div>
              <div className="card-kpi"><span>Novos Clientes</span><strong>0</strong></div>
              <div className="card-kpi"><span>Status do Caixa</span><strong className="status-aberto">ABERTO</strong></div>
            </div>
            
            <div className="dashboard-detalhes">
              <div className="painel-lista">
                <h4>Próximos Agendamentos</h4>
                <p className="vazio">Nenhum agendamento para as próximas horas.</p>
                {/* O histórico de lançamentos pode aparecer aqui no resumo também */}
                <div style={{marginTop: '20px'}}>
                   <HistoricoLancamentos user={user} unidadeId={unidadeId} />
                </div>
              </div>
              <div className="painel-lista">
                <h4>Ações Rápidas</h4>
                <button className="btn-atalho" onClick={() => setTelaAtiva('cadastros')}>+ Novo Cliente</button>
                <button className="btn-atalho" onClick={() => setTelaAtiva('agendamentos')}>+ Novo Agendamento</button>
                <button className="btn-atalho" onClick={() => setTelaAtiva('financeiro')}>+ Lançar Valor</button>
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
            <h3 style={{marginBottom: '20px'}}>Gestão Financeira</h3>
            <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
               <EntradaRapidaForm user={user} unidadeId={unidadeId} onBack={() => setTelaAtiva('resumo')} />
               <AdicionarDespesaForm user={user} unidadeId={unidadeId} onBack={() => setTelaAtiva('resumo')} />
            </div>
          </div>
        );

      case 'agendamentos':
      case 'servicos':
      case 'config':
        return (
          <div className="em-desenvolvimento">
            <h3>Módulo {telaAtiva.toUpperCase()}</h3>
            <p>Estamos trabalhando nesta funcionalidade...</p>
          </div>
        );

      default:
        return <div>Selecione uma opção no menu.</div>;
    }
  };

  return (
    <div className={`dashboard-layout ${menuAberto ? 'menu-on' : 'menu-off'}`}>
      
      {/* SIDEBAR FIXA */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Beleza BTO</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button className={telaAtiva === 'resumo' ? 'active' : ''} onClick={() => setTelaAtiva('resumo')}>📊 Resumo</button>
          <button className={telaAtiva === 'agendamentos' ? 'active' : ''} onClick={() => setTelaAtiva('agendamentos')}>📅 Agendamentos</button>
          <button className={telaAtiva === 'clientes' ? 'active' : ''} onClick={() => setTelaAtiva('clientes')}>👥 Clientes</button>
          <button className={telaAtiva === 'financeiro' ? 'active' : ''} onClick={() => setTelaAtiva('financeiro')}>💰 Financeiro</button>
          <button className={telaAtiva === 'servicos' ? 'active' : ''} onClick={() => setTelaAtiva('servicos')}>✂️ Serviços</button>
          <button className={telaAtiva === 'cadastros' ? 'active' : ''} onClick={() => setTelaAtiva('cadastros')}>📝 Cadastros</button>
          <button className={telaAtiva === 'config' ? 'active' : ''} onClick={() => setTelaAtiva('config')}>⚙️ Configurações</button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="btn-logout-sidebar">Sair do Sistema</button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL COM SCROLL INDEPENDENTE */}
      <main className="main-content">
        <header className="main-header">
          <button className="toggle-menu" onClick={() => setMenuAberto(!menuAberto)}>
            {menuAberto ? '✕' : '☰'}
          </button>
          <div className="user-info">
            <span>Olá, <strong>{user?.nome || 'Usuário'}</strong> 👋</span>
            <small>{unidadeAtual?.nome || 'Selecione uma unidade'}</small>
          </div>
        </header>

        {/* Única área que rola na tela */}
        <section className="content-body">
          {renderConteudo()}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;