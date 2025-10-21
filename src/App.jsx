import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import app from './firebaseConfig.js';
import loginForm from './loginForm.jsx';
import EntradaRapidaForm from './EntradaRapidaForm.jsx';
import AdicionarDespesaForm from './AdicionarDespesaForm.jsx';
import HistoricoLancamentos from './HistoricoLancamentos.jsx'; // Novo componente!

// NOVO: Dados de exemplo para as unidades. No futuro, virão do banco de dados.
const unidadesExemplo = [
  { id: 'unidade_1', nome: 'Barbearia Matriz - Centro' },
  { id: 'unidade_2', nome: 'Barbearia Filial - Bairro Novo' },
  { id: 'unidade_3', nome: 'Barbearia Premium - Shopping' },
];

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
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const q = query(collection(db, "colaboradores"), where("email", "==", currentUser.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setUserName(userData.nome || currentUser.email);
            // NOVO: Lógica para carregar as unidades (com dados de exemplo)
          // Na Etapa 2, vamos substituir isso por uma busca no banco de dados.
          setUnidades(unidadesExemplo);
          // Define a primeira unidade da lista como a padrão
          if (unidadesExemplo.length > 0) {
            setUnidadeSelecionada(unidadesExemplo[0].id);
            setUnidade(userData.empresa || '');}
          } else {
            setUserName(currentUser.email);
          }
        } catch (error) {
          console.error("Erro ao buscar dados do colaborador:", error);
          setUserName(currentUser.email);
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

