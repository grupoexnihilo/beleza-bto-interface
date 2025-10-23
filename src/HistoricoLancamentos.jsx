// --- useEffect COM LOGS DE DEBUG ---
  useEffect(() => {
    console.log("[HISTORICO useEffect] Iniciado."); // Log 1: O efeito correu?
    console.log("[HISTORICO useEffect] Valor de user:", user); // Log 2: O user existe?
    console.log("[HISTORICO useEffect] Valor de unidadeId:", unidadeId); // Log 3: A unidadeId existe?

    // Só busca se tivermos um email E uma unidade selecionada
    if (user && user.email && unidadeId) {
      console.log("[HISTORICO useEffect] CONDIÇÃO VERDADEIRA. A iniciar fetch."); // Log 4: Entrou no IF?
      const fetchHistorico = async () => {
        setIsLoading(true);
        setError(null);
        try {
          console.log(`[HISTORICO fetch] Buscando para email=${user.email}, unidadeId=${unidadeId}`); // Log 5: Parâmetros do Fetch
          const response = await fetch(`/api/getHistorico?email=${user.email}&unidadeId=${unidadeId}`);

          if (!response.ok) {
            const data = await response.json();
            console.error("[HISTORICO fetch] Erro na resposta da API:", data);
            throw new Error(data.message || 'Falha ao buscar histórico do servidor.');
          }
          
          const data = await response.json();
          console.log("[HISTORICO fetch] Dados recebidos:", data); // Log 6: O que a API devolveu?
          setLancamentos(data); 

        } catch (err) {
          console.error("[HISTORICO fetch] Erro no bloco catch:", err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistorico();
    } else {
      // Se não houver unidade ou user, limpa a lista
      console.log("[HISTORICO useEffect] CONDIÇÃO FALSA. Limpando lançamentos."); // Log 7: Não entrou no IF
      setLancamentos([]);
    }
  }, [user, unidadeId]); // Roda sempre que o user ou a unidadeId mudar
  // --- FIM DO useEffect COM LOGS ---