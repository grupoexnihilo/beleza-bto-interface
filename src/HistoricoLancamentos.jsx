// --- VERSÃO FINAL COM FILTROS DE DATA E JSX CORRIGIDO ---
import React, { useState, useEffect } from 'react';
import './HistoricoLancamentos.css';

// Função auxiliar fora do componente para formatar data para YYYY-MM-DD
const formatarDataParaInput = (data) => {
  if (!data || !(data instanceof Date)) return ''; // Adiciona verificação
  return data.toISOString().split('T')[0];
};

// Função auxiliar fora do componente para formatar data para DD/MM/YYYY
const formatarData = (dataISO) => {
    if (!dataISO || typeof dataISO !== 'string') return '-';
    // Verifica se já está no formato DD/MM/YYYY (do título) ou YYYY-MM-DD (do input)
    if (dataISO.includes('/')) return dataISO;
    if (dataISO.includes('-')) {
        const parts = dataISO.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    // Fallback para datas da API (com T)
    try {
        const [ano, mes, dia] = dataISO.split('T')[0].split('-');
        return `${dia}/${mes}/${ano}`;
    } catch (e) {
        console.error("Erro ao formatar data:", dataISO, e);
        return '-'; // Retorna '-' em caso de formato inesperado
    }
};

// Função auxiliar fora do componente para formatar valor monetário
const formatarValor = (valor) => {
  const numValor = parseFloat(valor || 0);
  return numValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};


function HistoricoLancamentos({ user, unidadeId }) {
  // --- Estados do Componente ---
  const [lancamentos, setLancamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mostrarReceitas, setMostrarReceitas] = useState(false);
  const [mostrarDespesas, setMostrarDespesas] = useState(false);
  const [dataInicioFiltro, setDataInicioFiltro] = useState(() => {
    const agora = new Date();
    return formatarDataParaInput(new Date(agora.getFullYear(), agora.getMonth(), 1));
  });
  const [dataFimFiltro, setDataFimFiltro] = useState(() => {
    const agora = new Date();
    return formatarDataParaInput(new Date(agora.getFullYear(), agora.getMonth() + 1, 0));
  });

  // --- Função para Buscar Dados ---
  const fetchHistorico = async (inicio, fim) => {
    if (!user || !user.email || !unidadeId || !inicio || !fim) {
      console.log("[HISTORICO fetch] Parâmetros em falta. Abortando busca.");
      setLancamentos([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ email: user.email, unidadeId, dataInicio: inicio, dataFim: fim });
      const url = `/api/getHistorico?${params.toString()}`;
      console.log(`[HISTORICO fetch] Buscando URL: ${url}`);
      const response = await fetch(url);
      const responseText = await response.text();
      console.log(`[HISTORICO fetch] Status: ${response.status}. Resposta Texto (inicio): ${responseText.substring(0,100)}...`);

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
      setLancamentos([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Efeito para Carga Inicial ---
  useEffect(() => {
    console.log(`[HISTORICO useEffect inicial] User ou Unidade mudou. Buscando mês atual.`);
    const agora = new Date();
    const inicioMesAtual = formatarDataParaInput(new Date(agora.getFullYear(), agora.getMonth(), 1));
    const fimMesAtual = formatarDataParaInput(new Date(agora.getFullYear(), agora.getMonth() + 1, 0));
    setDataInicioFiltro(inicioMesAtual);
    setDataFimFiltro(fimMesAtual);
    fetchHistorico(inicioMesAtual, fimMesAtual);
    setMostrarReceitas(false);
    setMostrarDespesas(false);
  }, [user, unidadeId]);

  // --- Handler do Botão Filtrar ---
  const handleFiltrarClick = () => {
    console.log(`[HISTORICO handleFiltrarClick] Filtrando de ${dataInicioFiltro} a ${dataFimFiltro}`);
    fetchHistorico(dataInicioFiltro, dataFimFiltro);
  };

  // --- Cálculos de Totais ---
  const totalReceitas = lancamentos
    .filter(item => item.tipo_de_operacao === 'Receita')
    .reduce((acc, item) => acc + parseFloat(item.valor_r || 0), 0);
  const totalDespesas = lancamentos
    .filter(item => item.tipo_de_operacao === 'Despesa')
    .reduce((acc, item) => acc + parseFloat(item.valor_r || 0), 0);

  // --- Função para Renderizar Linha de Detalhe ---
  const renderLinha = (item) => ( // Nome correto da função
    <tr key={item.id_de_lancamento}>
      <td>{formatarData(item.data_pagamento)}</td>
      <td>{item.descricao || item.categoria}</td>
      <td className={`valor-${item.tipo_de_operacao?.toLowerCase()}`}>
        {formatarValor(item.valor_r)}
      </td>
      {/* <td><button onClick={() => console.log('Editar:', item.id_de_lancamento)}>✎</button></td> */}
    </tr>
  );

  // --- Lógica de Renderização Principal ---
  const renderHistorico = () => {
    if (!unidadeId) { return <p className="historico-mensagem">Por favor, selecione uma unidade.</p>; }
    // Removemos o loading daqui para não piscar a cada filtro
    if (error) { return <p className="historico-mensagem erro">{error}</p>; }

    const receitasDoPeriodo = lancamentos.filter(item => item.tipo_de_operacao === 'Receita');
    const despesasDoPeriodo = lancamentos.filter(item => item.tipo_de_operacao === 'Despesa');

    return (
      <>
        {/* === Secção Receitas === */}
        <div className="resumo-seccao" onClick={() => setMostrarReceitas(!mostrarReceitas)} role="button" tabIndex={0}>
          <h3>{mostrarReceitas ? '▼' : '►'} Total Receitas ({formatarData(dataInicioFiltro)} a {formatarData(dataFimFiltro)}):</h3>
          <span className="valor-receita">{formatarValor(totalReceitas)}</span>
        </div>
        {/* Tabela de Receitas (Condicional com JSX correto) */}
        {mostrarReceitas && (
            receitasDoPeriodo.length > 0 ? (
                <div className="detalhe-tabela-wrapper">
                    <table className="tabela-lancamentos detalhe">
                    <thead><tr><th>Data Pag.</th><th>Descrição</th><th style={{ textAlign: 'right' }}>Valor</th>{/*<th>Ação</th>*/}</tr></thead>
                    <tbody>{receitasDoPeriodo.map(renderLinha)}</tbody> {/* Usando renderLinha */}
                    </table>
                </div>
            ) : (
                <p className="historico-mensagem detalhe">Nenhuma receita encontrada no período.</p>
            )
        )}

        {/* === Secção Despesas === */}
        <div className="resumo-seccao" onClick={() => setMostrarDespesas(!mostrarDespesas)} role="button" tabIndex={0}>
          <h3>{mostrarDespesas ? '▼' : '►'} Total Despesas ({formatarData(dataInicioFiltro)} a {formatarData(dataFimFiltro)}):</h3>
          <span className="valor-despesa">{formatarValor(totalDespesas)}</span>
        </div>
        {/* Tabela de Despesas (Condicional com JSX correto) */}
        {mostrarDespesas && (
            despesasDoPeriodo.length > 0 ? (
                <div className="detalhe-tabela-wrapper">
                    <table className="tabela-lancamentos detalhe">
                    <thead><tr><th>Data Pag.</th><th>Descrição</th><th style={{ textAlign: 'right' }}>Valor</th>{/*<th>Ação</th>*/}</tr></thead>
                    <tbody>{despesasDoPeriodo.map(renderLinha)}</tbody> {/* Usando renderLinha */}
                    </table>
                </div>
            ) : (
                <p className="historico-mensagem detalhe">Nenhuma despesa encontrada no período.</p>
            )
        )}
      </>
    );
  };

  // --- Return Principal do Componente ---
  return (
    <div className="historico-wrapper">
      {/* Formulário de Filtro */}
      <div className="filtro-historico">
        <div className="filtro-campo">
          <label htmlFor="dataInicio">De:</label>
          <input type="date" id="dataInicio" value={dataInicioFiltro} onChange={(e) => setDataInicioFiltro(e.target.value)} />
        </div>
        <div className="filtro-campo">
          <label htmlFor="dataFim">Até:</label>
          <input type="date" id="dataFim" value={dataFimFiltro} onChange={(e) => setDataFimFiltro(e.target.value)} />
        </div>
        <button onClick={handleFiltrarClick} disabled={isLoading} className="botao-filtrar">
          {isLoading ? 'A Filtrar...' : 'Filtrar Período'}
        </button>
      </div>

      {/* Título e Conteúdo do Histórico */}
      <h2>Resumo do Período Selecionado</h2>
      {/* Mostra 'A carregar...' apenas durante a busca */}
      {isLoading && <p className="historico-mensagem">A carregar...</p>}
      {!isLoading && renderHistorico()} {/* Renderiza totais/tabelas se não estiver loading */}
    </div>
  );
}

export default HistoricoLancamentos;