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

  // --- FUNÇÃO PARA RENDERIZAR O CONTEÚDO CENTRAL ---
  const renderConteudo = () => {
    switch (telaAtiva) {
      case 'resumo':
        return (
          <div className="resumo-dashboard">
            {/* CARDS DE RESUMO FLUIDOS */}
            <div className="cards-grid">
              <div className="card-kpi">
                <span>Agendamentos Hoje</span>
                <strong>0</strong>
              </div>
              <div className="card-kpi">
                <span>Faturamento (Dia)</span>
                <strong>R$ 0,00</strong>
              </div>
              <div className="card-kpi">
                <span>Novos Clientes</span>
                <strong>0</strong>
              </div>
              <div className="card-kpi">
                <span>Status do Caixa</span>
                <strong style={{ color: '#10b981' }}>ABERTO</strong>
              </div>
            </div>
            
            <div className="dashboard-detalhes">
              {/* TABELA DE PRÓXIMOS AGENDAMENTOS NO PADRÃO PROFISSIONAL */}
              <div className="painel-lista">
                <h4>Próximos Agendamentos</h4>
                <div className="table-wrapper" style={{ marginTop: '15px' }}>
                  <table className="clientes-table">
                    <thead>
                      <tr>
                        <th>Horário</th>
                        <th>Cliente</th>
                        <th>Serviço</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                          Nenhum agendamento para hoje.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PAINEL DE AÇÕES RÁPIDAS COM BOTÕES ARREDONDADOS */}
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
            <h3 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>Gestão Financeira e Histórico</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
               <EntradaRapidaForm user={user} unidadeId={unidadeId} onBack={() => setTelaAtiva('resumo')} />
               <AdicionarDespesaForm user={user} unidadeId={unidadeId} onBack={() => setTelaAtiva('resumo')} />
            </div>
            <HistoricoLancamentos user={user} unidadeId={unidadeId} />
          </div>
        );

      case 'agendamentos':
      case 'servicos':
      case 'config':
        return (
          <div className="em-desenvolvimento">
            <h3>Módulo {telaAtiva.toUpperCase()}</h3>
            <p>Estamos preparando as ferramentas desta seção...</p>
          </div>
        );

      default:
        return <div>Selecione uma opção no menu lateral.</div>;
    }
  };

  return (
    <div className={`dashboard-layout ${menuAberto ? 'menu-on' : 'menu-off'}`}>
      
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2 style={{ letterSpacing: '1px' }}>Beleza BTO</h2>
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
          <p style={{ fontSize: '10px', color: '#444', textAlign: 'center', marginBottom: '10px' }}>v3.0.1 PRO</p>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="main-content">
        <header className="main-header">
          <button className="toggle-menu" onClick={() => setMenuAberto(!menuAberto)}>
            ☰
          </button>
          
          <div className="header-right">
            <div className="user-info">
              <span>Olá, <strong>{user?.nome || 'Usuário'}</strong> 👋</span>
              <small>{unidadeAtual?.nome || 'Unidade não selecionada'}</small>
            </div>
            <button className="btn-sair-header" onClick={onLogout}>
              Sair do Sistema
            </button>
          </div>
        </header>

        {/* ÁREA DE CONTEÚDO COM SCROLL */}
        <section className="content-body">
          {renderConteudo()}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;