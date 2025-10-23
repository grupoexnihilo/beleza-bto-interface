import React, { useState, useEffect } from 'react';
// --- useEffect CORRIGIDO (Balanceamento de {} e ()) ---
  useEffect(() => {
    console.log("[APP useEffect onAuthStateChanged] INICIANDO LISTENER");
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("[APP onAuthStateChanged] Callback executado. currentUser:", currentUser ? currentUser.email : null);
      setUser(currentUser); // Atualiza o estado 'user'
      console.log("[APP onAuthStateChanged] Estado 'user' DEFINIDO para:", currentUser ? currentUser.email : null);

      if (currentUser) {
        // Se há utilizador, busca os dados dele na nossa API
        setLoading(true); // Mostra loading enquanto busca dados da API
        try {
          console.log(`[APP onAuthStateChanged] Chamando API getOperadorData para email: ${currentUser.email}`);

          // --- Bloco ÚNICO para buscar dados do operador ---
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
          // --- Fim do Bloco ÚNICO ---

        } catch (error) {
           console.error("[APP onAuthStateChanged] Erro no bloco try/catch ao buscar dados:", error);
           setUserName(currentUser.email);
           setUnidades([]);
           setUnidadeSelecionada('');
        } finally {
          setLoading(false); // Esconde o loading após a busca (sucesso ou erro)
        }
      } else {
        // Se não há utilizador (logout ou inicialização)
        console.log("[APP onAuthStateChanged] User é NULL (Logout?). Limpando estados."); // Esta linha estava cortada
        setUser(null);
        setUserName('');
        setUnidades([]);
        setUnidadeSelecionada('');
        setLoading(false);
      } // <<<----- CHAVE DE FECHO DO 'else' ADICIONADA
    }); // <<<----- PARÊNTESE E PONTO-E-VÍRGULA DE FECHO DO 'onAuthStateChanged' ADICIONADOS

    // Função de limpeza do listener ao desmontar o componente
    return () => {
        console.log("[APP useEffect onAuthStateChanged] DESMONTANDO LISTENER");
        unsubscribe();
    }
  }, [auth]); // Dependência apenas de 'auth'
  // --- FIM DO useEffect CORRIGIDO ---
  export default App;