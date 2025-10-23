// --- VERSÃO DE TESTE COM URL FIXA ---
import React, { useState, useEffect } from 'react';
import './HistoricoLancamentos.css';

// Recebemos 'user' (do Auth) e 'unidadeId' (do dropdown) do App.jsx
function HistoricoLancamentos({ user, unidadeId }) {
  const [lancamentos, setLancamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- useEffect COM FILTRO DE MÊS ATUAL ---
  useEffect(() => {
    console.log(`[HISTORICO useEffect Cycle] user: ${user ? user.email : 'undefined'}, unidadeId: ${unidadeId}`);

    if (user && typeof user.email === 'string' && user.email.length > 0 && unidadeId && unidadeId !== '') {
      console.log(`[HISTORICO useEffect] CONDIÇÃO VERDADEIRA. Email: ${user.email}, Unidade: ${unidadeId}. Iniciando fetch.`);

      const fetchHistorico = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // --- CÁLCULO DAS DATAS DO MÊS ATUAL ---
          const agora = new Date();
          const primeiroDia = new Date(agora.getFullYear(), agora.getMonth(), 1);
          const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0); // O dia 0 do mês seguinte é o último do anterior

          // Formata as datas para YYYY-MM-DD
          const dataInicio = primeiroDia.toISOString().split('T')[0];
          const dataFim = ultimoDia.toISOString().split('T')[0];
          console.log(`[HISTORICO fetch] Buscando período: ${dataInicio} a ${dataFim}`);
          // --- FIM DO CÁLCULO ---

          // --- CONSTRUÇÃO DA URL COM DATAS ---
          const params = new URLSearchParams({
            email: user.email,
            unidadeId: unidadeId,
            dataInicio: dataInicio, // Envia a data de início
            dataFim: dataFim,       // Envia a data de fim
          });
          const url = `/api/getHistorico?${params.toString()}`;
          console.log(`[HISTORICO fetch] Buscando URL: ${url}`);
          // --- FIM DA CONSTRUÇÃO ---

          const response = await fetch(url);
          const responseText = await response.text();

          console.log(`[HISTORICO fetch] Status da Resposta: ${response.status}`);
          console.log(`[HISTORICO fetch] Resposta (Texto): ${responseText.substring(0, 100)}...`);

          if (!response.ok) {
            let errorData = { message: `Erro ${response.status}` };
            try { errorData = JSON.parse(responseText); } catch (e) { /* Ignora */ }
            console.error("[HISTORICO fetch] Erro na resposta da API:", errorData);
            throw new Error(errorData.message || `Falha ao buscar histórico (${response.status})`);
          }

          const data = JSON.parse(responseText);
          console.log("[HISTORICO fetch] Dados JSON recebidos:", data);
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
      console.log("[HISTORICO useEffect] CONDIÇÃO FALSA. Limpando lançamentos.");
      setLancamentos([]);
    }
  }, [user, unidadeId]);
  // --- FIM DO useEffect COM FILTRO DE MÊS ATUAL ---

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