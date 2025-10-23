// --- VERSÃO DE TESTE COM URL FIXA ---
import React, { useState, useEffect } from 'react';
import './HistoricoLancamentos.css';

// Recebemos 'user' (do Auth) e 'unidadeId' (do dropdown) do App.jsx
function HistoricoLancamentos({ user, unidadeId }) {
  const [lancamentos, setLancamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Efeito para buscar os dados do histórico
  useEffect(() => {
    console.log("[HISTORICO useEffect - TESTE URL FIXA] Iniciado.");
    console.log("[HISTORICO useEffect - TESTE URL FIXA] User:", user);
    console.log("[HISTORICO useEffect - TESTE URL FIXA] UnidadeId:", unidadeId);

    // Só busca se tivermos um email E uma unidade selecionada
    if (user && user.email && unidadeId) {
      console.log("[HISTORICO useEffect - TESTE URL FIXA] Condição VERDADEIRA.");
      const fetchHistorico = async () => {
        setIsLoading(true);
        setError(null);
        try {
          console.log(`[HISTORICO fetch - TESTE URL FIXA] Buscando com URL fixa.`);

          // --- ESTA É A LINHA SIMPLIFICADA PARA TESTE ---
          const response = await fetch('/api/getHistorico?email=teste@teste.com&unidadeId=1');
          // ---------------------------------------------

          if (!response.ok) {
            const data = await response.json();
            console.error("[HISTORICO fetch - TESTE URL FIXA] Erro API:", data);
            throw new Error(data.message || 'Falha ao buscar histórico (URL fixa).');
          }

          const data = await response.json();
          console.log("[HISTORICO fetch - TESTE URL FIXA] Dados recebidos:", data);
          setLancamentos(data);

        } catch (err) {
          console.error("[HISTORICO fetch - TESTE URL FIXA] Erro Catch:", err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistorico();
    } else {
      console.log("[HISTORICO useEffect - TESTE URL FIXA] Condição FALSA.");
      setLancamentos([]);
    }
  }, [user, unidadeId]);

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