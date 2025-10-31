// --- VERSÃO COMPLETA FINAL (Filtros + Pesquisa + DELETE) ---
import React, { useState, useEffect } from 'react';
import './HistoricoLancamentos.css';

// ***** INÍCIO DAS FUNÇÕES AUXILIARES (DEFINIDAS ANTES DO COMPONENTE) *****
const formatarDataParaInput = (data) => {
  if (!data || !(data instanceof Date) || isNaN(data.getTime())) {
      console.warn("formatarDataParaInput recebeu data inválida:", data);
      return '';
  }
  try {
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0'); // Mês é base 0
      const ano = data.getFullYear();
      return `${ano}-${mes}-${dia}`;
  } catch (e) {
      console.error("Erro ao formatar data para input:", data, e);
      return '';
  }
};

const formatarData = (dataInput) => {
  if (!dataInput || typeof dataInput !== 'string') return '-';
  try {
    const dataObj = new Date(dataInput);
    if (isNaN(dataObj.getTime())) {
      const parts = dataInput.split('-');
      if (parts.length === 3) {
          const [ano, mes, dia] = parts;
          if (!isNaN(parseInt(dia)) && !isNaN(parseInt(mes)) && !isNaN(parseInt(ano))) {
              const diaF = String(dia).padStart(2, '0');
              const mesF = String(mes).padStart(2, '0');
              return `${diaF}/${mesF}/${ano}`;
          }
      }
      return '-';
    }
    const dia = String(dataObj.getUTCDate()).padStart(2, '0');
    const mes = String(dataObj.getUTCMonth() + 1).padStart(2, '0');
    const ano = dataObj.getUTCFullYear();
    return `${dia}/${mes}/${ano}`;
  } catch (e) {
    console.error("Erro ao formatar data:", dataInput, e);
    return '-';
  }
};

const formatarValor = (valor) => {
  const numValor = parseFloat(valor || 0);
  if (isNaN(numValor)) {
      return 'R$ 0,00';
  }
  return numValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
// ***** FIM DAS FUNÇÕES AUXILIARES *****


// ***** INÍCIO DO COMPONENTE PRINCIPAL *****
function HistoricoLancamentos({ user, unidadeId }) {
  // --- Estados do Componente ---
  const [lancamentos, setLancamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null); // <-- NOVO ESTADO PARA DELETE
  const [error, setError] = useState(null);
  const [mostrarReceitas, setMostrarReceitas] = useState(false);
  const [mostrarDespesas, setMostrarDespesas] = useState(false);
  const [dataInicioFiltro, setDataInicioFiltro] = useState('');
  const [dataFimFiltro, setDataFimFiltro] = useState('');
  const [termoPesquisa, setTermoPesquisa] = useState('');

  // --- Função para Buscar Dados ---
  const fetchHistorico = async (inicio, fim, pesquisa) => {
    if (!user?.email || !unidadeId || !inicio || !fim ) {
        console.warn("[HISTORICO fetch] Parâmetros inválidos. Abortando.", { email: user?.email, unidadeId, inicio, fim });
        setError("Erro: Dados do utilizador, unidade ou período inválidos para a busca.");
        setLancamentos([]);
        setIsLoading(false);
        return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(inicio) || !dateRegex.test(fim)) {
        console.warn("[HISTORICO fetch] Formato de data inválido para API. Abortando.", { inicio, fim });
        setError("Formato de data inválido para filtro (use AAAA-MM-DD).");
        setLancamentos([]);
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ email: user.email, unidadeId, dataInicio: inicio, dataFim: fim });
      if (pesquisa && pesquisa.trim() !== '') {
        params.append('termoPesquisa', pesquisa.trim());
      }
      const url = `/api/getHistorico?${params.toString()}`;
      console.log(`[HISTORICO fetch] Buscando URL: ${url}`);
      const response = await fetch(url);
      const responseText = await response.text();
      console.log(`[HISTORICO fetch] Status: ${response.status}. Resposta Texto (inicio): ${responseText.substring(0,100)}...`);

      if (!response.ok) {
        let errorData = { message: `Erro ${response.status} ao buscar histórico.` };
        try { errorData = JSON.parse(responseText); } catch (e) { /* Ignora */ }
        throw new Error(errorData.message || `Falha ao buscar histórico (${response.status})`);
      }
      const data = JSON.parse(responseText);
      console.log("[HISTORICO fetch] Dados JSON recebidos:", data);
      setLancamentos(data);
    } catch (err) {
      console.error("[HISTORICO fetch] Erro no bloco catch:", err);
      setError(err.message || "Ocorreu um erro ao buscar o histórico.");
      setLancamentos([]);
    } finally {
      setIsLoading(false);
    }
  }; // --- FIM fetchHistorico ---

  // --- Efeito para Carga Inicial ---
  useEffect(() => {
    console.log(`[HISTORICO useEffect inicial] User ou Unidade mudou.`);
    try {
        const agora = new Date();
        const inicioMesAtual = formatarDataParaInput(new Date(agora.getFullYear(), agora.getMonth(), 1));
        const fimMesAtual = formatarDataParaInput(new Date(agora.getFullYear(), agora.getMonth() + 1, 0));

        if (inicioMesAtual && fimMesAtual) {
            console.log(`[HISTORICO useEffect inicial] Definindo e buscando datas: ${inicioMesAtual} a ${fimMesAtual}`);
            setDataInicioFiltro(inicioMesAtual);
            setDataFimFiltro(fimMesAtual);
            setTermoPesquisa('');
            if (user && user.email && unidadeId) {
                fetchHistorico(inicioMesAtual, fimMesAtual, '');
            } else {
                 console.log("[HISTORICO useEffect inicial] User ou UnidadeId ainda não definidos, aguardando.");
                 setLancamentos([]);
            }
        } else {
            console.error("[HISTORICO useEffect inicial] Erro ao calcular datas do mês atual (resultado vazio).");
            setError("Erro ao definir período inicial.");
            setLancamentos([]);
        }
    } catch (e) {
        console.error("[HISTORICO useEffect inicial] Erro GERAL inesperado ao calcular datas:", e);
        setError("Erro crítico ao definir período.");
        setLancamentos([]);
    } finally {
        setMostrarReceitas(false);
        setMostrarDespesas(false);
    }
  }, [user, unidadeId]); // --- FIM useEffect ---

  // --- Handler do Botão Filtrar ---
  const handleFiltrarClick = () => {
    if (!dataInicioFiltro || !dataFimFiltro) { /* ... validações ... */ return; }
    if (new Date(dataFimFiltro + 'T23:59:59Z') < new Date(dataInicioFiltro + 'T00:00:00Z')) { /* ... validações ... */ return; }
    console.log(`[HISTORICO handleFiltrarClick] Filtrando de ${dataInicioFiltro} a ${dataFimFiltro} com pesquisa: "${termoPesquisa}"`);
    fetchHistorico(dataInicioFiltro, dataFimFiltro, termoPesquisa);
  }; // --- FIM handleFiltrarClick ---

  // --- NOVO: Handler para o Botão Excluir ---
  const handleDeleteClick = async (idParaApagar) => {
    if (!window.confirm("Tem a certeza que quer apagar este lançamento? Esta ação não pode ser desfeita.")) {
      return;
    }
    setIsDeleting(idParaApagar);
    setError(null);
    try {
      const response = await fetch('/api/deleteLancamento', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idParaApagar }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Falha ao apagar (Status: ${response.status})`);
      }
      // Sucesso: Remove o item da lista local
      setLancamentos(listaAtual => listaAtual.filter(item => item.id_de_lancamento !== idParaApagar));
      console.log(`[HISTORICO handleDelete] Lançamento ${idParaApagar} apagado.`);
    } catch (err) {
      console.error("[HISTORICO handleDelete] Erro:", err);
      setError(err.message || "Ocorreu um erro ao apagar.");
    } finally {
      setIsDeleting(null);
    }
  };
  // --- FIM NOVO HANDLER ---

  // --- Cálculos de Totais ---
  const totalReceitas = lancamentos
    .filter(item => item.tipo_de_operacao === 'Receita')
    .reduce((acc, item) => acc + parseFloat(item.valor_r || 0), 0);
  const totalDespesas = lancamentos
    .filter(item => item.tipo_de_operacao === 'Despesa')
    .reduce((acc, item) => acc + parseFloat(item.valor_r || 0), 0);

  // --- Função para Renderizar Linha (COM BOTÃO DELETE) ---
  const renderLinha = (item) => (
    <tr key={item.id_de_lancamento} className={isDeleting === item.id_de_lancamento ? 'deleting' : ''}>
      <td>{formatarData(item.data_pagamento)}</td>
      <td>{item.descricao || item.categoria}</td>
      <td className={`valor-${item.tipo_de_operacao?.toLowerCase()}`}>
        {formatarValor(item.valor_r)}
      </td>
      {/* CÉLULA DE AÇÕES */}
      <td className="coluna-acoes">
        {/* <button className="botao-acao editar" disabled={isDeleting} title="Editar">✎</button> */} {/* Botão Editar (futuro) */}
        <button
          className="botao-acao apagar"
          onClick={() => handleDeleteClick(item.id_de_lancamento)}
          disabled={isDeleting === item.id_de_lancamento} // Desabilita só este botão
          title="Apagar"
        >
          {isDeleting === item.id_de_lancamento ? '...' : '🗑️'}
        </button>
      </td>
    </tr>
  );
  // --- FIM renderLinha ---

  // --- Lógica de Renderização Principal ---
  const renderHistorico = () => {
    if (!unidadeId) { return <p className="historico-mensagem">Por favor, selecione uma unidade.</p>; }
    if (error && !isLoading) { return <p className="historico-mensagem erro">{error}</p>; }
    if (lancamentos.length === 0 && !isLoading && !error) {
        return <p className="historico-mensagem">Nenhum lançamento encontrado para o período e pesquisa selecionados.</p>;
    }
    if (isLoading && lancamentos.length === 0) { return null; } // Evita piscar "vazio" durante a carga inicial

    const receitasDoPeriodo = lancamentos.filter(item => item.tipo_de_operacao === 'Receita');
    const despesasDoPeriodo = lancamentos.filter(item => item.tipo_de_operacao === 'Despesa');

    return (
      <>
        {/* Secção Receitas */}
        <div className="resumo-seccao" onClick={() => setMostrarReceitas(!mostrarReceitas)} role="button" tabIndex={0}>
          <h3>{mostrarReceitas ? '▼' : '►'} Total Receitas ({formatarData(dataInicioFiltro)} a {formatarData(dataFimFiltro)}):</h3>
          <span className="valor-receita">{formatarValor(totalReceitas)}</span>
        </div>
        {mostrarReceitas && ( receitasDoPeriodo.length > 0 ? ( <div className="detalhe-tabela-wrapper"> <table className="tabela-lancamentos detalhe"><thead><tr><th>Data Pag.</th><th>Descrição</th><th style={{ textAlign: 'right' }}>Valor</th><th className="coluna-acoes-header">Ações</th></tr></thead><tbody>{receitasDoPeriodo.map(renderLinha)}</tbody></table></div> ) : ( <p className="historico-mensagem detalhe">Nenhuma receita encontrada no período.</p> ) )}

        {/* Secção Despesas */}
        <div className="resumo-seccao" onClick={() => setMostrarDespesas(!mostrarDespesas)} role="button" tabIndex={0}>
          <h3>{mostrarDespesas ? '▼' : '►'} Total Despesas ({formatarData(dataInicioFiltro)} a {formatarData(dataFimFiltro)}):</h3>
          <span className="valor-despesa">{formatarValor(totalDespesas)}</span>
        </div>
        {mostrarDespesas && ( despesasDoPeriodo.length > 0 ? ( <div className="detalhe-tabela-wrapper"> <table className="tabela-lancamentos detalhe"><thead><tr><th>Data Pag.</th><th>Descrição</th><th style={{ textAlign: 'right' }}>Valor</th><th className="coluna-acoes-header">Ações</th></tr></thead><tbody>{despesasDoPeriodo.map(renderLinha)}</tbody></table></div> ) : ( <p className="historico-mensagem detalhe">Nenhuma despesa encontrada no período.</p> ) )}
      </>
    );
  }; // --- FIM renderHistorico ---

  // --- Return Principal ---
  return (
    <div className="historico-wrapper">
      {/* Filtro */}
      <div className="filtro-historico">
        <div className="filtro-campo"> <label htmlFor="dataInicio">De:</label> <input type="date" id="dataInicio" value={dataInicioFiltro} onChange={(e) => setDataInicioFiltro(e.target.value)} /> </div>
        <div className="filtro-campo"> <label htmlFor="dataFim">Até:</label> <input type="date" id="dataFim" value={dataFimFiltro} onChange={(e) => setDataFimFiltro(e.target.value)} /> </div>
        <div className="filtro-campo"> <label htmlFor="pesquisa">Pesquisar:</label> <input type="search" id="pesquisa" placeholder="Descrição ou Categoria..." value={termoPesquisa} onChange={(e) => setTermoPesquisa(e.target.value)} /> </div>
        <button onClick={handleFiltrarClick} disabled={isLoading} className="botao-filtrar"> {isLoading ? 'A Filtrar...' : 'Filtrar'} </button>
      </div>

      {/* Resumo */}
      <h2>Resumo do Período Selecionado</h2>
      {isLoading && <p className="historico-mensagem">A carregar...</p>}
      {!isLoading && renderHistorico()}
    </div>
  );
} // ***** FIM DO COMPONENTE HistoricoLancamentos *****

export default HistoricoLancamentos;