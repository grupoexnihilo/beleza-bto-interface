import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

import app from './firebaseConfig.js';
import loginForm from './loginForm.jsx';
import EntradaRapidaForm from './EntradaRapidaForm.jsx';
import AdicionarDespesaForm from './AdicionarDespesaForm.jsx';
import HistoricoLancamentos from './HistoricoLancamentos.jsx'; // Novo componente!



function App() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [unidade, setUnidade] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'receitas', 'despesas'
  // NOVO: Estados para gerenciar as unidades
  const [unidades, setUnidades] = useState([]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState('');
  const auth = getAuth(app);


  useEffect(() => {
    console.log("--- EXECUTANDO A VERSÃO MAIS RECENTE DO App.jsx (Build do Vercel) ---");
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // COLE ESTE NOVO BLOCO 'try...catch' NO LUGAR
      try {
        // 1. Chamamos nossa nova API Vercel
        const response = await fetch(`/api/getOperadorData?email=${currentUser.email}`);
        
        if (!response.ok) {
          throw new Error('Falha ao buscar dados da API do operador');
        }
        
        const data = await response.json(); // Pega { nome: "...", unidades: [...] }

        // 2. Populamos os estados com dados REAIS vindos do Neon
        setUserName(data.nome || currentUser.email);
        setUnidades(data.unidades); // A API retorna o array de unidades reais

        // 3. Define a primeira unidade da lista como padrão
        if (data.unidades && data.unidades.length > 0) {
          setUnidadeSelecionada(data.unidades[0].id);
        } else {
          // Caso o operador não tenha unidades
          setUnidadeSelecionada('');
        }

      } catch (error) {
        console.error("Erro ao buscar dados do operador via API:", error);
        setUserName(currentUser.email); // Fallback em caso de erro
        setUnidades([]); // Fallback para array vazio
      }
      } else {
        // Limpa os dados quando o utilizador faz logout
        setUserName('');
        setUnidade('');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []); // Dependências removidas para evitar re-execuções desnecessárias

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // O 'onAuthStateChanged' já tratará de limpar os estados.
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };
 // NOVO: Função para lidar com a mudança da unidade no dropdown
  const handleUnidadeChange = (e) => {
    const novaUnidadeId = e.target.value;
    setUnidadeSelecionada(novaUnidadeId);
    console.log("Unidade selecionada:", novaUnidadeId); // Para testes!
  };
  if (loading) {
    return <div className="loading-container">A carregar...</div>;
  }

  const renderLoggedInView = () => {
    console.log('--- Verificando a visão ---');
  console.log('O React está a tentar mostrar a visão:', currentView);
    switch (currentView) {
      case 'receitas':
         // MODIFICADO: Passamos a unidade selecionada para o formulário
        return <EntradaRapidaForm user={user} unidadeId={unidadeSelecionada} onBack={() => setCurrentView('dashboard')} />;
      case 'despesas':
       // MODIFICADO: Passamos a unidade selecionada para o formulário
        return <AdicionarDespesaForm user={user} unidadeId={unidadeSelecionada} onBack={() => setCurrentView('dashboard')} />;
      default:
        return (
          <div className="dashboard-container">
            <h2>Painel de Ações</h2>
             {/* NOVO: Componente do seletor de unidades */}
              {unidades.length > 0 && (
                <div className="unidade-selector">
                  <label htmlFor="unidade-select">Unidade de Trabalho:</label>
                  <select id="unidade-select" value={unidadeSelecionada} onChange={handleUnidadeChange}>
                    {unidades.map(unidade => (
                      <option key={unidade.id} value={unidade.id}>
                        {unidade.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            <div className="action-buttons">
              <button onClick={() => setCurrentView('receitas')} className="action-button">
                Adicionar Receita
              </button>
              <button onClick={() => setCurrentView('despesas')} className="action-button">
                Adicionar Despesa
              </button>
                  {/* MODIFICADO: Passamos o ID da unidade selecionada para o histórico */}
            <HistoricoLancamentos unidadeId={unidadeSelecionada} />
            </div>
           </div>
          
        );
    }
  };

  return (
    <div className="app-container">
      {user ? (
        <div>
          <header className="app-header">
            <span>Bem-vindo, {userName}!</span>
            <button onClick={handleLogout} className="logout-button">Sair</button>
          </header>
          <main>
            {renderLoggedInView()}
          </main>
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}

export default App;

