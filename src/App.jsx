// --- VERSÃO COMPLETA E CORRIGIDA DE App.jsx ---
import React, { useState, useEffect } from 'react'; // <-- IMPORT CORRETO
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import app from './firebaseConfig.js'; // Configuração do Firebase Auth
import LoginForm from './LoginForm.jsx'; // Corrigido para L maiúsculo
import EntradaRapidaForm from './EntradaRapidaForm.jsx';
import AdicionarDespesaForm from './AdicionarDespesaForm.jsx';
import HistoricoLancamentos from './HistoricoLancamentos.jsx';
import logoBelezaBTO from './logo-beleza-bto.png';

function App() {
  console.log("--- EXECUTANDO A VERSÃO MAIS RECENTE DO App.jsx (Build do Vercel) ---");

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
      setUser(currentUser); // Atualiza o estado 'user'
      console.log("[APP onAuthStateChanged] Estado 'user' DEFINIDO para:", currentUser ? currentUser.email : null);

      if (currentUser) {
        // Se há utilizador, busca os dados dele na nossa API
        // setLoading(true); // Não precisa redefinir loading aqui, já começou true
        try {
          console.log(`[APP onAuthStateChanged] Chamando API getOperadorData para email: ${currentUser.email}`);

          const response = await fetch(`/api/getOperadorData?email=${currentUser.email}`);
          console.log(`[APP onAuthStateChanged] Status da API getOperadorData: ${response.status}`);

          if (!response.ok) {
            let errorMsg = `Falha ao buscar dados da API (${response.status})`;
            try {
              const errorData = await response.json();
              errorMsg = errorData.message || errorMsg;
            } catch (parseError) { /* Ignora se não for JSON */ }
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
            console.log("[APP onAuthStateChanged] Nenhuma unidade encontrada. Unidade Selecionada definida para ''");
          }

        } catch (error) {
           console.error("[APP onAuthStateChanged] Erro no bloco try/catch ao buscar dados:", error);
           setUserName(currentUser.email); // Fallback
           setUnidades([]);
           setUnidadeSelecionada('');
        } finally {
          setLoading(false); // Esconde o loading após a busca (sucesso ou erro)
        }
      } else {
        // Se não há utilizador (logout ou inicialização)
        console.log("[APP onAuthStateChanged] User é NULL (Logout?). Limpando estados.");
        setUser(null);
        setUserName('');
        setUnidades([]);
        setUnidadeSelecionada('');
        setLoading(false); // Garante que o loading para se começar deslogado
      }
    }); // FIM DO CALLBACK onAuthStateChanged

    // Função de limpeza
    return () => {
        console.log("[APP useEffect onAuthStateChanged] DESMONTANDO LISTENER");
        unsubscribe();
    }
  }, [auth]); // Dependência: auth
  // --- FIM DO useEffect ---

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
  if (loading) { // Mostra loading enquanto o estado inicial do Auth está a ser verificado
    return <div className="loading-container">A carregar autenticação...</div>;
  }

  if (!user) { // Se não está loading E não há user, mostra Login
    return (
       <div className="app-container">
          <LoginForm />
       </div>
    );
  }

  // Se chegou aqui, está logado. Renderiza a vista principal.
  const renderLoggedInView = () => {
    console.log(`[APP renderLoggedInView] Renderizando visão '${currentView}'. Passando user: ${user ? user.email : null}, unidadeSelecionada: ${unidadeSelecionada}`);
    switch (currentView) {
      case 'receitas':
        return <EntradaRapidaForm user={user} unidadeId={unidadeSelecionada} onBack={() => setCurrentView('dashboard')} />;
      case 'despesas':
        return <AdicionarDespesaForm user={user} unidadeId={unidadeSelecionada} onBack={() => setCurrentView('dashboard')} />;
      default: // 'dashboard'
        return (
          <div className="dashboard-container">
            <h2>Painel de Ações</h2> {/* Mantemos o H2 de teste */}

            {/* Seletor de Unidades (Lógica corrigida) */}
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
            {!loading && unidades.length === 0 && ( // Mensagem se não houver unidades
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
  {/* --- ADICIONAR LOGO AQUI --- */}
        <div style={{ display: 'flex', alignItems: 'center' }}> {/* Wrapper para alinhar logo e texto */}
          <img src={logoBelezaBTO} alt="Beleza BTO Logo" className="app-logo" />
          <span>Bem-vindo, {userName || (user ? user.email : '')}!</span>
        </div>
        {/* --- FIM LOGO --- */}
        <button onClick={handleLogout} className="logout-button">Sair</button>
      </header>
      <main>
        {renderLoggedInView()}
      </main>
    </div>
  );
} // --- FIM DA FUNÇÃO App ---

export default App; // <<<----- LINHA ESSENCIAL NO FINAL