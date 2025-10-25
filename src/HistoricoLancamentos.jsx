// --- VERSÃO REFINADA COM TOTAIS E EXPANSÃO ---
import React, { useState, useEffect } from 'react';
import './HistoricoLancamentos.css'; // Precisaremos de ajustar o CSS depois

function HistoricoLancamentos({ user, unidadeId }) {
  const [lancamentos, setLancamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- NOVOS ESTADOS PARA VISIBILIDADE ---
  const [mostrarReceitas, setMostrarReceitas] = useState(false);
  const [mostrarDespesas, setMostrarDespesas] = useState(false);
  const [mostrarCompleto, setMostrarCompleto] = useState(false); // Controla a lista completa
  // --- FIM NOVOS ESTADOS ---

  useEffect(() => {
    // Resetar visibilidade sempre que a unidade mudar
    setMostrarReceitas(false);
    setMostrarDespesas(false);
    setMostrarCompleto(false);

    if (user && user.email && unidadeId) {
      const fetchHistorico = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const agora = new Date();
          const primeiroDia = new Date(agora.getFullYear(), agora.getMonth(), 1);
          const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
          const dataInicio = primeiroDia.toISOString().split('T')[0];
          const dataFim = ultimoDia.toISOString().split('T')[0];

          const params = new URLSearchParams({ email: user.email, unidadeId, dataInicio, dataFim });
          const url = `/api/getHistorico?${params.toString()}`;
          console.log(`[HISTORICO fetch] Buscando URL: ${url}`);

          const response = await fetch(url);
          const responseText = await response.text();

          if (!response.ok) {
            let errorData = { message: `Erro ${response.status}` };
            try { errorData = JSON.parse(responseText); } catch (e) { /* Ignora */ }
            throw new Error(errorData.message || `Falha ao buscar histórico (${response.status})`);
          }

          const data = JSON.parse(responseText);
          console.log("[HISTORICO fetch] Dados JSON recebidos:", data);
          setLancamentos(data);

        } catch (err) {
          console.error("[HISTORICO fetch] Erro no bloco catch:", err);
          setError(err.message);
          setLancamentos([]); // Garante que a lista fica vazia em caso de erro
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistorico();
    } else {
      setLancamentos([]);
    }
  }, [user, unidadeId]);

  // --- CÁLCULO DOS TOTAIS ---
  const totalReceitas = lancamentos
    .filter(item => item.tipo_de_operacao === 'Receita')
    .reduce((acc, item) => acc + parseFloat(item.valor_r || 0), 0);

  const totalDespesas = lancamentos
    .filter(item => item.tipo_de_operacao === 'Despesa')
    .reduce((acc, item) => acc + parseFloat(item.valor_r || 0), 0);
  // --- FIM CÁLCULO TOTAIS ---

  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    const [ano, mes, dia] = dataISO.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const formatarValor = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // --- FUNÇÃO PARA RENDERIZAR UMA LINHA DA TABELA ---
  const renderLinha = (item) => (
    <tr key={item.id_de_lancamento}>
      <td>{formatarData(item.data_pagamento)}</td>
      <td>{item.descricao || item.categoria}</td>
      <td className={`valor-${item.tipo_de_operacao.toLowerCase()}`}>
        {formatarValor(parseFloat(item.valor_r || 0))}
      </td>
       {/* Adicionaremos o botão Editar aqui depois */}
      {/* <td><button>Editar</button></td> */}
    </tr>
  );
  // --- FIM FUNÇÃO LINHA ---

  // --- LÓGICA DE RENDERIZAÇÃO PRINCIPAL ---
  // --- LÓGICA DE RENDERIZAÇÃO PRINCIPAL (CORRIGIDA) ---
  const renderHistorico = () => {
    // Condições de guarda iniciais
    if (!unidadeId) {
      return <p className="historico-mensagem">Por favor, selecione uma unidade.</p>;
    }
    if (isLoading) {
      return <p className="historico-mensagem">A carregar histórico...</p>;
    }
    if (error) {
      return <p className="historico-mensagem erro">{error}</p>;
    }
    if (lancamentos.length === 0) {
      return <p className="historico-mensagem">Nenhum lançamento encontrado para este mês nesta unidade.</p>;
    }

    // Filtra as listas DEPOIS de garantir que 'lancamentos' tem dados
    const receitasDoMes = lancamentos.filter(item => item.tipo_de_operacao === 'Receita');
    const despesasDoMes = lancamentos.filter(item => item.tipo_de_operacao === 'Despesa');

    return (
      // Usamos Fragment <> para agrupar múltiplos elementos
      <>
        {/* === Secção Receitas === */}
        <div className="resumo-seccao" onClick={() => setMostrarReceitas(!mostrarReceitas)} role="button" tabIndex={0} /* Acessibilidade */ >
          <h3>{mostrarReceitas ? '▼' : '►'} Total Receitas do Mês:</h3>
          <span className="valor-receita">{formatarValor(totalReceitas)}</span>
        </div>
        {/* Tabela de Receitas (Condicional) */}
        {mostrarReceitas && receitasDoMes.length > 0 && (
          <div className="detalhe-tabela-wrapper"> {/* Wrapper para estilo/animação */}
            <table className="tabela-lancamentos detalhe">
              <thead>
                <tr>
                  <th>Data Pag.</th>
                  <th>Descrição</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                  {/* Futuro Cabeçalho Editar */}
                  {/* <th>Ação</th> */}
                </tr>
              </thead>
              <tbody>
                {receitasDoMes.map(renderLinha)}
              </tbody>
            </table>
          </div>
        )}
        {mostrarReceitas && receitasDoMes.length === 0 && (
            <p className="historico-mensagem detalhe">Nenhuma receita encontrada.</p>
        )}


        {/* === Secção Despesas === */}
        <div className="resumo-seccao" onClick={() => setMostrarDespesas(!mostrarDespesas)} role="button" tabIndex={0}>
          <h3>{mostrarDespesas ? '▼' : '►'} Total Despesas do Mês:</h3>
          <span className="valor-despesa">{formatarValor(totalDespesas)}</span>
        </div>
        {/* Tabela de Despesas (Condicional) */}
        {mostrarDespesas && despesasDoMes.length > 0 && (
          <div className="detalhe-tabela-wrapper">
            <table className="tabela-lancamentos detalhe">
              <thead>
                <tr>
                  <th>Data Pag.</th>
                  <th>Descrição</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                  {/* <th>Ação</th> */}
                </tr>
              </thead>
              <tbody>
                {despesasDoMes.map(renderLinha)}
              </tbody>
            </table>
          </div>
        )}
         {mostrarDespesas && despesasDoMes.length === 0 && (
            <p className="historico-mensagem detalhe">Nenhuma despesa encontrada.</p>
        )}

        {/* Removido o botão/tabela "Histórico Completo" por agora para simplificar */}

      </> // Fim do Fragment
    );
  }; // --- FIM DA FUNÇÃO renderHistorico ---

  return (
    <div className="historico-wrapper">
      <h2>Resumo do Mês Atual</h2>
      {renderHistorico()}
    </div>
  );
}

export default HistoricoLancamentos;