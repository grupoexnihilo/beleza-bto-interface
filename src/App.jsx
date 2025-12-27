// --- VERSÃO FINAL App.jsx - FASE 3 ---
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import app from './firebaseConfig.js'; 
import LoginForm from './LoginForm.jsx';
import EntradaRapidaForm from './EntradaRapidaForm.jsx';
import AdicionarDespesaForm from './AdicionarDespesaForm.jsx';
import HistoricoLancamentos from './HistoricoLancamentos.jsx';

// Novos Componentes da Fase 3
import CadastroClienteForm from './CadastroClienteForm.jsx';
import BaseClientes from './BaseClientes.jsx'; // Vamos criar este arquivo a seguir

import logoBelezaBTO from './logo-beleza-bto.png';

function App() {
  console.log("--- APP BELEZA BTO: FASE 3 INICIADA ---");

  // --- Estados do Componente ---
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [unidades, setUnidades] = useState([]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState('');

  const auth = getAuth(app);

  // --- Efeito de Autenticação ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const response = await fetch(`/api/getOperadorData?email=${currentUser.email}`);
          if (!response.ok) throw new Error("Erro ao carregar dados do operador");

          const data = await response.json();
          setUserName(data.nome || currentUser.email);
          setUnidades(data.unidades || []);

          if (data.unidades && data.unidades.length > 0) {
            setUnidadeSelecionada(data.unidades[0].id);
          }
        } catch (error) {
           console.error("Erro no Auth Callback:", error);
           setUserName(currentUser.email);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // --- Funções de Navegação e Logout ---
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView('dashboard');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const handleUnidadeChange = (e) => {
    setUnidadeSelecionada(e.target.value);
  };

  // --- Renderização de Telas ---
  const renderLoggedInView = () => {
    switch (currentView) {
      case 'receitas':
        return <EntradaRapidaForm user={user} unidadeId={unidadeSelecionada} onBack={() => setCurrentView('dashboard')} />;
      
      case 'despesas':
        return <AdicionarDespesaForm user={user} unidadeId={unidadeSelecionada} onBack={() => setCurrentView('dashboard')} />;
      
      case 'clientes':
        return (
          <CadastroClienteForm 
            user={user} 
            unidadeId={unidadeSelecionada} 
            unidades={unidades} 
            onBack={() => setCurrentView('dashboard')} 
          />
        );

      case 'base_clientes':
        return (
          <BaseClientes 
            unidadeId={unidadeSelecionada} 
            onBack={() => setCurrentView('dashboard')} 
          />
        );

      default: // Dashboard Principal
        return (
          <div className="dashboard-container">
            <h2>Painel de Ações</h2>

            {unidades.length > 0 && (
              <div className="unidade-selector">
                <label htmlFor="unidade-select">Unidade de Trabalho:</label>
                <select id="unidade-select" value={unidadeSelecionada} onChange={handleUnidadeChange}>
                  {unidades.map(unidade => (
                    <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="action-buttons">
              <button onClick={() => setCurrentView('receitas')} className="action-button" disabled={!unidadeSelecionada}>
                Adicionar Receita
              </button>
              <button onClick={() => setCurrentView('despesas')} className="action-button" disabled={!unidadeSelecionada}>
                Adicionar Despesa
              </button>
              {/* Botões Novos */}
              <button onClick={() => setCurrentView('clientes')} className="action-button" style={{backgroundColor: '#4f46e5'}}>
                Novo Cliente
              </button>
              <button onClick={() => setCurrentView('base_clientes')} className="action-button" style={{backgroundColor: '#0ea5e9'}}>
                Base de Clientes
              </button>
            </div>

            <HistoricoLancamentos user={user} unidadeId={unidadeSelecionada} />
          </div>
        );
    }
  };

  if (loading) return <div className="loading-container">A carregar sistema...</div>;

  if (!user) return <div className="app-container"><LoginForm /></div>;

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logoBelezaBTO} alt="Beleza BTO Logo" className="app-logo" />
          <span>Bem-vindo, {userName || user.email}!</span>
        </div>
        <button onClick={handleLogout} className="logout-button">Sair</button>
      </header>
      <main>
        {renderLoggedInView()}
      </main>
    </div>
  );
}

export default App;