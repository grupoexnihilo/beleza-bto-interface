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
  const [telaAtiva, setTelaAtiva] = useState('resumo');
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
              <div className="painel-lista">
                <h4>Próximos Agendamentos</h4>
                <div className="table-wrapper" style={{ marginTop: '20px' }}>
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
                        <td colSpan="4" style={{ textAlign: 'center', padding: '50px', color: '#555' }}>
                          Nenhum agendamento para hoje.
                        </td>
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

  return (
    <div className="dashboard-main-wrapper">
      <header className="navbar-superior">
        <div className="nav-top-row">
          <div className="nav-logo-area">
            <img src={logoBelezaBTO} alt="Logo" className="nav-logo-img" />
          </div>
          <div className="nav-user-actions">
            <div className="user-greeting">
              <span>Olá, <strong>{user?.nome || 'Usuário'}</strong> 👋</span>
              <small>{unidadeAtual?.nome}</small>
            </div>
            <button className="btn-sair-pill" onClick={onLogout}>Sair do Sistema</button>
          </div>
        </div>

        <nav className="nav-bottom-row">
          <button className={`nav-item-fluido ${telaAtiva === 'resumo' ? 'active' : ''}`} onClick={() => setTelaAtiva('resumo')}>📊 Resumo</button>
          <button className={`nav-item-fluido ${telaAtiva === 'agendamentos' ? 'active' : ''}`} onClick={() => setTelaAtiva('agendamentos')}>📅 Agendamentos</button>
          <button className={`nav-item-fluido ${telaAtiva === 'clientes' ? 'active' : ''}`} onClick={() => setTelaAtiva('clientes')}>👥 Clientes</button>
          <button className={`nav-item-fluido ${telaAtiva === 'financeiro' ? 'active' : ''}`} onClick={() => setTelaAtiva('financeiro')}>💰 Financeiro</button>
          <button className={`nav-item-fluido ${telaAtiva === 'servicos' ? 'active' : ''}`} onClick={() => setTelaAtiva('servicos')}>✂️ Serviços</button>
          <button className={`nav-item-fluido ${telaAtiva === 'cadastros' ? 'active' : ''}`} onClick={() => setTelaAtiva('cadastros')}>📝 Cadastros</button>
          <button className={`nav-item-fluido ${telaAtiva === 'config' ? 'active' : ''}`} onClick={() => setTelaAtiva('config')}>⚙️ Configurações</button>
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