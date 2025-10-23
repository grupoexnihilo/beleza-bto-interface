// Este é o NOVO ficheiro: /src/HistoricoLancamentos.jsx
import React, { useState, useEffect } from 'react';
import './HistoricoLancamentos.css';

// Recebemos 'user' (do Auth) e 'unidadeId' (do dropdown) do App.jsx
function HistoricoLancamentos({ user, unidadeId }) {
  const [lancamentos, setLancamentos] = useState([]); // Começa vazio
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Efeito para buscar os dados do histórico
  useEffect(() => {
    // Só busca se tivermos um email E uma unidade selecionada
    if (user && user.email && unidadeId) {
      const fetchHistorico = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Chama a nossa nova API de histórico
          const response = await fetch(`/api/getHistorico?email=${user.email}&unidadeId=${unidadeId}`);
          
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Falha ao buscar histórico do servidor.');
          }
          
          const data = await response.json();
          setLancamentos(data); // Preenche o histórico com dados do Neon

        } catch (err) {
          console.error("Erro ao buscar histórico:", err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchHistorico();
    } else {
      // Se não houver unidade ou user, limpa a lista
      setLancamentos([]);
    }
  }, [user, unidadeId]); // Roda sempre que o user ou a unidadeId mudar

  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    const [ano, mes, dia] = dataISO.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const formatarValor = (valor) => {
    return parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Renderização condicional
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
      return <tr><td colSpan="4">Nenhum lançamento encontrado para si nesta unidade.</td></tr>;
    }

    // Mapeia os dados REAIS vindos do Neon
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