import React, { useState } from 'react';
import './Dashboard.css';

// Importação da sua Logo e Componentes
import logoBelezaBTO from './logo-beleza-bto.png';
import BaseClientes from './BaseClientes';
import CadastroClienteForm from './CadastroClienteForm';
import EntradaRapidaForm from './EntradaRapidaForm';
import AdicionarDespesaForm from './AdicionarDespesaForm';
import HistoricoLancamentos from './HistoricoLancamentos';

function Dashboard({ user, unidadeId, unidades, onLogout }) {
  const [telaAtiva, setTelaAtiva] = useState('resumo');

  // Localiza o nome da unidade atual para exibição
  const unidadeAtual = unidades.find(u => u.id === unidadeId);

  // --- RENDERIZAÇÃO DE CONTEÚDO (ESTABILIZADA) ---
  const renderConteudo = () => {
    switch (telaAtiva) {
      case 'resumo':
        return (
          <div className="resumo-dashboard">
            <div className="cards-grid">
              <div className="card-kpi"><span>Agendamentos Hoje</span><strong>0</strong></div>
              <div className="card-kpi"><span>Faturamento (Dia)</span><strong>R$ 0,00</strong></div>
              <div className="card-kpi"><span>Novos Clientes</span><strong>0</strong></div>
              <div className="card-kpi"><span>Status do Caixa</span><strong style={{ color: '#10b981' }}>ABERTO</strong></div>
            </div>
            
            <div className="dashboard-detalhes">
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

      case 'clientes':
        return <BaseClientes unidadeId={unidadeId} onBack={() => setTelaAtiva('resumo')} />;

      case 'cadastros':
        return <CadastroClienteForm user={user} unidadeId={unidadeId} unidades={unidades} onBack={() => setTelaAtiva('resumo')} />;

      case 'financeiro':
        return (
          <div className="modulo-financeiro">
            <h3 style={{ marginBottom: '20px', color: '#0ea5e9' }}>Gestão Financeira e Histórico</h3>
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
            <p>Esta funcionalidade está sendo preparada para o seu fluxo de trabalho.</p>
          </div>
        );

      default:
        return <div className="em-desenvolvimento">Selecione uma opção no menu superior.</div>;
    }
  };

  return (
    <div className="dashboard-main-wrapper">
      
      {/* HEADER SUPERIOR FIXO */}
      <header className="navbar-superior">
        <div className="nav-top-row">
          <div className="nav-logo-area">
            {/* LOGO DO SISTEMA */}
            <img src={logoBelezaBTO} alt="Beleza BTO" className="nav-logo-img" />
          </div>
          
          <div className="nav-user-actions">
            <div className="user-greeting">
              <span>Olá, <strong>{user?.nome || 'Usuário'}</strong> 👋</span>
              <small>{unidadeAtual?.nome || 'Carregando unidade...'}</small>
            </div>
            {/* BOTÃO SAIR ALINHADO À DIREITA */}
            <button className="btn-sair-pill" onClick={onLogout}>Sair do Sistema</button>
          </div>
        </div>

        {/* MENU DE NAVEGAÇÃO COM BOTÕES FLUIDOS */}
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

      {/* ÁREA DE CONTEÚDO ESTABILIZADA */}
      <main className="content-container-fixo">
        <section className="content-body-scroll">
          {renderConteudo()}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;