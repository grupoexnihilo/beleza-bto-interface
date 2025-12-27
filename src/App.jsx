// --- VERSÃO COMPLETA E CORRIGIDA DE App.jsx - ATUALIZADA FASE 3 ---
import React, { useState, useEffect } from 'react'; // <-- IMPORT CORRETO
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import app from './firebaseConfig.js'; // Configuração do Firebase Auth
import LoginForm from './LoginForm.jsx'; 
import EntradaRapidaForm from './EntradaRapidaForm.jsx';
import AdicionarDespesaForm from './AdicionarDespesaForm.jsx';
import HistoricoLancamentos from './HistoricoLancamentos.jsx';
import CadastroClienteForm from './CadastroClienteForm.jsx'; // <-- NOVO COMPONENTE
import logoBelezaBTO from './logo-beleza-bto.png';

function App() {
  console.log("--- EXECUTANDO A VERSÃO MAIS RECENTE DO App.jsx (Build do Vercel com Clientes) ---");

  // --- Estados do Componente ---
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true); // Começa true para esperar o Auth
  const [currentView, setCurrentView] = useState('dashboard');
  const [unidades, setUnidades] = useState([]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState('');

  const auth = getAuth(app);

  // --- Efeito para Autenticação e Busca Inicial de Dados ---
  useEffect(() => {
    console.log("[APP useEffect onAuthStateChanged] INICIANDO LISTENER");
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("[APP onAuthStateChanged] Callback executado. currentUser:", currentUser ? currentUser.email : null);
      setUser(currentUser); 
      console.log("[APP onAuthStateChanged] Estado 'user' DEFINIDO para:", currentUser ? currentUser.email : null);

      if (currentUser) {
        try {
          console.log(`[APP onAuthStateChanged] Chamando API getOperadorData para email: ${currentUser.email}`);

          const response = await fetch(`/api/getOperadorData?email=${currentUser.email}`);
          console.log(`[APP onAuthStateChanged] Status da API getOperadorData: ${response.status}`);

          if (!response.ok) {
            let errorMsg = `Falha ao buscar dados da API (${response.status})`;
            try {
              const errorData = await response.json();
              errorMsg = errorData.message || errorMsg;
            } catch (parseError) { /* Ignora */ }
            console.error("[APP onAuthStateChanged] Erro na RESPOSTA da API:", errorMsg);
            throw new Error(errorMsg);
          }

          const data = await response.json();
          console.log("[APP onAuthStateChanged] Resposta da API (data):", data);

          setUserName(data.nome || currentUser.email);
          setUnidades(data.unidades || []);

          if (data.unidades && data.unidades.length > 0) {
            const primeiraUnidadeId = data.unidades[0].id;
            setUnidadeSelecionada(primeiraUnidadeId);
            console.log("[APP onAuthStateChanged] Unidade Selecionada definida para:", primeiraUnidadeId);
          } else {
            setUnidadeSelecionada('');
            console.log("[APP onAuthStateChanged] Nenhuma unidade encontrada.");
          }

        } catch (error) {
           console.error("[APP onAuthStateChanged] Erro no bloco try/catch ao buscar dados:", error);
           setUserName(currentUser.email); 
           setUnidades([]);
           setUnidadeSelecionada('');
        } finally {
          setLoading(false); 
        }
      } else {
        console.log("[APP onAuthStateChanged] User é NULL. Limpando estados.");
        setUser(null);
        setUserName('');
        setUnidades([]);
        setUnidadeSelecionada('');
        setLoading(false);
      }
    });

    return () => {
        console.log("[APP useEffect onAuthStateChanged] DESMONTANDO LISTENER");
        unsubscribe();
    }
  }, [auth]);

  // --- Funções Handler ---
  const handleLogout = async () => {
    console.log("[APP handleLogout] Iniciando logout...");
    try {
      await signOut(auth);
      console.log("[APP handleLogout] Logout concluído.");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleUnidadeChange = (e) => {
    const novaUnidadeId = e.target.value;
    console.log("[APP handleUnidadeChange] Nova unidade selecionada:", novaUnidadeId);
    setUnidadeSelecionada(novaUnidadeId);
  };

  // --- Lógica de Renderização ---
  if (loading) {
    return <div className="loading-container">A carregar autenticação...</div>;
  }

  if (!user) {
    return (
       <div className="app-container">
          <LoginForm />
       </div>
    );
  }

  // Se chegou aqui, está logado. Renderiza a vista principal.
  const renderLoggedInView = () => {
    console.log(`[APP renderLoggedInView] Renderizando visão '${currentView}'.`);
    switch (currentView) {
      case 'receitas':
        return <EntradaRapidaForm user={user} unidadeId={unidadeSelecionada} onBack={() => setCurrentView('dashboard')} />;
      case 'despesas':
        return <AdicionarDespesaForm user={user} unidadeId={unidadeSelecionada} onBack={() => setCurrentView('dashboard')} />;
      case 'clientes': // <-- NOVA VISÃO DE CADASTRO DE CLIENTES
        return <CadastroClienteForm onBack={() => setCurrentView('dashboard')} />;
      default: // 'dashboard'
        return (
          <div className="dashboard-container">
            <h2>Painel de Ações</h2>

            {/* Seletor de Unidades */}
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
            {!loading && unidades.length === 0 && (
                 <p>Nenhuma unidade associada a este utilizador.</p>
            )}

            {/* Botões de Ação */}
            <div className="action-buttons">
              <button onClick={() => setCurrentView('receitas')} className="action-button" disabled={!unidadeSelecionada}>
                Adicionar Receita
              </button>
              <button onClick={() => setCurrentView('despesas')} className="action-button" disabled={!unidadeSelecionada}>
                Adicionar Despesa
              </button>
              {/* NOVO BOTÃO DE CLIENTES */}
              <button 
                onClick={() => setCurrentView('clientes')} 
                className="action-button" 
                style={{ backgroundColor: '#4f46e5' }} // Cor roxa para destacar
              >
                Cadastrar Cliente
              </button>
            </div>

            {/* Histórico */}
            <HistoricoLancamentos user={user} unidadeId={unidadeSelecionada} />
          </div>
        );
    }
  };

  // --- Return Principal (Quando Logado) ---
  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logoBelezaBTO} alt="Beleza BTO Logo" className="app-logo" />
          <span>Bem-vindo, {userName || (user ? user.email : '')}!</span>
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