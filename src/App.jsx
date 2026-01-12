// --- APP.JSX INTEGRADO COM DASHBOARD ---
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import app from '../firebaseConfig.js'; 
import LoginForm from './modules/LoginForm.jsx';
import Dashboard from './Dashboard';

function App() {
  console.log("--- APP BELEZA BTO: DASHBOARD MODE ---");

  // --- Estados de Autenticação e Dados ---
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unidades, setUnidades] = useState([]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState('');

  const auth = getAuth(app);

  // --- Monitor de Autenticação ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // Busca dados profissionais do operador (nome, unidades permitidas)
          const response = await fetch(`/api/getOperadorData?email=${currentUser.email}`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
            setUnidades(data.unidades || []);
            
            // Define a primeira unidade como padrão
            if (data.unidades && data.unidades.length > 0) {
              setUnidadeSelecionada(data.unidades[0].id);
            }
          }
        } catch (error) {
          console.error("Erro ao carregar dados do operador:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Reset de estados ao deslogar
        setUser(null);
        setUserData(null);
        setUnidades([]);
        setUnidadeSelecionada('');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // --- Função de Logout ---
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Sessão encerrada com sucesso.");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  // --- Tela de Carregamento Inicial ---
  if (loading) {
    return (
      <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', background: '#111111)' }}>
        Iniciando sistema Beleza BTO...
      </div>
    );
  }

  // --- Fluxo de Login ---
  if (!user) {
    return <LoginForm />;
  }

  // --- Sistema Logado (Dashboard assume o controle) ---
  return (
    <Dashboard 
      user={userData || { nome: user.email }} 
      unidadeId={unidadeSelecionada}
      setUnidadeId={setUnidadeSelecionada} // Permite ao Dashboard trocar de unidade
      unidades={unidades} 
      onLogout={handleLogout} 
    />
  );
}

export default App;