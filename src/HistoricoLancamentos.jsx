// --- VERSÃO DE TESTE COM URL FIXA ---
import React, { useState, useEffect } from 'react';
import './HistoricoLancamentos.css';

// Recebemos 'user' (do Auth) e 'unidadeId' (do dropdown) do App.jsx
function HistoricoLancamentos({ user, unidadeId }) {
  const [lancamentos, setLancamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Efeito para buscar os dados do histórico
// --- useEffect COM LOGS REFINADOS ---
  useEffect(() => {
    // Log 1: Mostra cada vez que o efeito corre e os valores atuais
    console.log(`[HISTORICO useEffect Cycle] user: ${user ? user.email : 'undefined'}, unidadeId: ${unidadeId}`);

    // Só busca se tivermos um email VÁLIDO E uma unidadeId VÁLIDA
    if (user && typeof user.email === 'string' && user.email.length > 0 && unidadeId && unidadeId !== '') {
      console.log(`[HISTORICO useEffect] CONDIÇÃO VERDADEIRA. Email: ${user.email}, Unidade: ${unidadeId}. Iniciando fetch.`); // Log 2: Confirma que entrou no IF

      const fetchHistorico = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const params = new URLSearchParams({ email: user.email, unidadeId: unidadeId });
          const url = `/api/getHistorico?${params.toString()}`;
          console.log(`[HISTORICO fetch] Buscando URL: ${url}`); // Log 3: URL do Fetch

          const response = await fetch(url);
          const responseText = await response.text(); // Lê a resposta como texto PRIMEIRO

          console.log(`[HISTORICO fetch] Status da Resposta: ${response.status}`); // Log 4: Status HTTP
          console.log(`[HISTORICO fetch] Resposta (Texto): ${responseText.substring(0, 100)}...`); // Log 5: Primeiros 100 chars da resposta

          if (!response.ok) {
            // Tenta analisar como JSON se possível, senão usa o texto
            let errorData = { message: `Erro ${response.status}` };
            try { errorData = JSON.parse(responseText); } catch (e) { /* Ignora erro de parse */ }
            console.error("[HISTORICO fetch] Erro na resposta da API:", errorData);
            throw new Error(errorData.message || `Falha ao buscar histórico (${response.status})`);
          }

          // Se chegou aqui, a resposta é OK (2xx) e podemos analisar como JSON
          const data = JSON.parse(responseText);
          console.log("[HISTORICO fetch] Dados JSON recebidos:", data); // Log 6: Dados JSON
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
      console.log("[HISTORICO useEffect] CONDIÇÃO FALSA. Limpando lançamentos."); // Log 7: Não entrou no IF ou valores inválidos
      setLancamentos([]); // Limpa se a condição for falsa
    }
  }, [user, unidadeId]);
  // --- FIM DO useEffect COM LOGS REFINADOS ---

  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    const [ano, mes, dia] = dataISO.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const formatarValor = (valor) => {
    return parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const renderContent = () => {
    if (!unidadeId) {
      return <tr><td colSpan="4">Por favor, selecione uma unidade.</td></tr>;
    }
    if (isLoading) {
      return <tr><td colSpan="4">A carregar histórico...</td></tr>;
    }
    if (error) {
      return <tr><td colSpan="4" className="valor-despesa">{error}</td></tr>;
    }
    if (lancamentos.length === 0) {
      return <tr><td colSpan="4">Nenhum lançamento encontrado para si nesta unidade (Teste URL Fixa).</td></tr>;
    }
    return lancamentos.map(item => (
      <tr key={item.id_de_lancamento}>
        <td>{formatarData(item.data_pagamento)}</td>
        <td>{item.descricao || item.categoria}</td>
        <td className="valor-receita">
          {item.tipo_de_operacao === 'Receita' ? formatarValor(item.valor_r) : '-'}
        </td>
        <td className="valor-despesa">
          {item.tipo_de_operacao === 'Despesa' ? formatarValor(item.valor_r) : '-'}
        </td>
      </tr>
    ));
  };

  return (
    <div className="historico-wrapper">
      <h2>Histórico de Lançamentos Recentes</h2>
      <table className="tabela-lancamentos">
        <thead>
          <tr>
            <th>Data Pag.</th>
            <th>Descrição</th>
            <th>Receita</th>
            <th>Despesa</th>
          </tr>
        </thead>
        <tbody>
          {renderContent()}
        </tbody>
      </table>
    </div>
  );
}

export default HistoricoLancamentos;