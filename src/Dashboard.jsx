import React, { useState } from 'react';
import './Dashboard.css';
import BaseClientes from './BaseClientes';
import CadastroClienteForm from './CadastroClienteForm';

function Dashboard({ user, unidadeId, unidades, onLogout }) {
  const [menuAberto, setMenuAberto] = useState(true);
  const [telaAtiva, setTelaAtiva] = useState('resumo');

  const unidadeAtual = unidades.find(u => u.id === unidadeId);

  // Função para renderizar o conteúdo central baseado no menu selecionado
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
              </div>
              <div className="painel-lista">
                <h4>Ações Rápidas</h4>
                <button className="btn-atalho" onClick={() => setTelaAtiva('cadastro-cliente')}>+ Novo Cliente</button>
                <button className="btn-atalho">+ Novo Agendamento</button>
                <button className="btn-atalho">+ Lançar Despesa</button>
              </div>
            </div>
          </div>
        );
      case 'clientes':
        return <BaseClientes unidadeId={unidadeId} onBack={() => setTelaAtiva('resumo')} />;
      case 'cadastro-cliente':
        return <CadastroClienteForm user={user} unidadeId={unidadeId} unidades={unidades} onBack={() => setTelaAtiva('clientes')} />;
      default:
        return <div className="em-desenvolvimento"><h3>Módulo {telaAtiva} em desenvolvimento...</h3></div>;
    }
  };

  return (
    <div className={`dashboard-layout ${menuAberto ? 'menu-on' : 'menu-off'}`}>
      
      {/* SIDEBAR */}
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
          <button onClick={onLogout}>Sair</button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="main-content">
        <header className="main-header">
          <button className="toggle-menu" onClick={() => setMenuAberto(!menuAberto)}>☰</button>
          <div className="user-info">
            <span>Olá, <strong>{user?.nome || 'Usuário'}</strong> 👋</span>
            <small>{unidadeAtual?.nome}</small>
          </div>
        </header>

        <section className="content-body">
          {renderConteudo()}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;