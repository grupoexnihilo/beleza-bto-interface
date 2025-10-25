// --- VERSÃO FINAL COMPLETA (Filtros, Pesquisa, Helpers Corrigidos) ---
import React, { useState, useEffect } from 'react';
import './HistoricoLancamentos.css';

// ***** INÍCIO DAS FUNÇÕES AUXILIARES (DEFINIDAS ANTES DO COMPONENTE) *****
const formatarDataParaInput = (data) => {
  // Retorna string vazia se a data for inválida
  if (!data || !(data instanceof Date) || isNaN(data.getTime())) {
      console.warn("formatarDataParaInput recebeu data inválida:", data);
      return '';
  }
  try {
      // Formata como YYYY-MM-DD para o input type="date"
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0'); // Mês é base 0
      const ano = data.getFullYear();
      return `${ano}-${mes}-${dia}`;
  } catch (e) {
      console.error("Erro ao formatar data para input:", data, e);
      return ''; // Retorna vazio em caso de erro
  }
};

const formatarData = (dataInput) => {
  // Retorna '-' se a entrada for inválida ou vazia
  if (!dataInput || typeof dataInput !== 'string') return '-';

  try {
    // Tenta criar um objeto Date a partir da string recebida (ISO ou YYYY-MM-DD)
    const dataObj = new Date(dataInput);

    // Verifica se a data criada é válida
    if (isNaN(dataObj.getTime())) {
      // Se falhar, tenta interpretar como YYYY-MM-DD (caso venha do input)
      const parts = dataInput.split('-');
      if (parts.length === 3) {
          const [ano, mes, dia] = parts;
          // Verifica se as partes são numéricas antes de retornar
          if (!isNaN(parseInt(dia)) && !isNaN(parseInt(mes)) && !isNaN(parseInt(ano))) {
              return `${dia}/${mes}/${ano}`;
          }
      }
      console.warn("Formato de data inválido recebido:", dataInput);
      return '-'; // Retorna '-' se a data for inválida
    }

    // Extrai dia, mês e ano usando métodos que respeitam o fuso horário LOCAL do navegador
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0'); // Mês é base 0
    const ano = dataObj.getFullYear();

    // Retorna no formato DD/MM/YYYY
    return `${dia}/${mes}/${ano}`;

  } catch (e) {
    console.error("Erro inesperado ao formatar data:", dataInput, e);
    return '-'; // Fallback
  }
};

const formatarValor = (valor) => {
  const numValor = parseFloat(valor || 0);
  // Verifica se é um número válido antes de formatar
  if (isNaN(numValor)) {
      console.warn("Valor inválido para formatar:", valor);
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
  const [error, setError] = useState(null);
  const [mostrarReceitas, setMostrarReceitas] = useState(false);
  const [mostrarDespesas, setMostrarDespesas] = useState(false);
  // Inicializa datas vazias, serão definidas no useEffect
  const [dataInicioFiltro, setDataInicioFiltro] = useState('');
  const [dataFimFiltro, setDataFimFiltro] = useState('');
  const [termoPesquisa, setTermoPesquisa] = useState('');

  // --- Função para Buscar Dados ---
  const fetchHistorico = async (inicio, fim, pesquisa) => {
    // Validação robusta dos parâmetros
    if (!user?.email || !unidadeId || !inicio || !fim ) {
        console.warn("[HISTORICO fetch] Parâmetros inválidos. Abortando.", { email: user?.email, unidadeId, inicio, fim });
        setError("Erro: Dados do utilizador, unidade ou período inválidos para a busca.");
        setLancamentos([]); // Limpa lançamentos se os parâmetros estiverem errados
        setIsLoading(false); // Garante que o loading para
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
    setError(null); // Limpa erro anterior antes de nova busca
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
        let errorData = { message: `Erro ${response.status} ao buscar histórico.` }; // Mensagem mais específica
        try { errorData = JSON.parse(responseText); } catch (e) { /* Ignora */ }
        throw new Error(errorData.message || `Falha ao buscar histórico (${response.status})`);
      }
      const data = JSON.parse(responseText);
      console.log("[HISTORICO fetch] Dados JSON recebidos:", data);
      setLancamentos(data);
    } catch (err) {
      console.error("[HISTORICO fetch] Erro no bloco catch:", err);
      setError(err.message || "Ocorreu um erro ao buscar o histórico."); // Mensagem de erro genérica se necessário
      setLancamentos([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Efeito para Carga Inicial ---
  useEffect(() => {
    console.log(`[HISTORICO useEffect inicial] User ou Unidade mudou.`);
    // Calcula as datas do mês atual DE FORMA SEGURA
    try {
        const agora = new Date();
        // Usamos getDate para garantir que pegamos o dia/mês/ano corretos localmente
        const inicioMesAtual = formatarDataParaInput(new Date(agora.getFullYear(), agora.getMonth(), 1));
        const fimMesAtual = formatarDataParaInput(new Date(agora.getFullYear(), agora.getMonth() + 1, 0));

        if (inicioMesAtual && fimMesAtual) {
            console.log(`[HISTORICO useEffect inicial] Definindo e buscando datas: ${inicioMesAtual} a ${fimMesAtual}`);
            setDataInicioFiltro(inicioMesAtual);
            setDataFimFiltro(fimMesAtual);
            setTermoPesquisa('');
            // Chama fetchHistorico APENAS se user e unidadeId já estiverem definidos
            if (user && user.email && unidadeId) {
                fetchHistorico(inicioMesAtual, fimMesAtual, '');
            } else {
                 console.log("[HISTORICO useEffect inicial] User ou UnidadeId ainda não definidos, aguardando próxima renderização.");
                 setLancamentos([]); // Garante que está vazio se não buscar
            }
        } else {
            console.error("[HISTORICO useEffect inicial] Erro ao calcular datas do mês atual.");
            setError("Erro ao definir período inicial.");
            setLancamentos([]);
        }
    } catch (e) {
        console.error("[HISTORICO useEffect inicial] Erro GERAL ao calcular datas:", e);
        setError("Erro crítico ao definir período.");
        setLancamentos([]);
    }

    // Resetar visibilidade expansível
    setMostrarReceitas(false);
    setMostrarDespesas(false);
  }, [user, unidadeId]); // Dependências corretas

  // --- Handler do Botão Filtrar ---
  const handleFiltrarClick = () => {
    if (!dataInicioFiltro || !dataFimFiltro) {
        setError("Por favor, selecione as datas de início e fim.");
        return;
    }
    // Converte as datas para objetos Date para comparação
    const inicio = new Date(dataInicioFiltro);
    const fim = new Date(dataFimFiltro);
    // Adiciona verificação simples se a data fim é anterior à data início
    if (fim < inicio) {
        setError("A data 'Até' não pode ser anterior à data 'De'.");
        return;
    }

    console.log(`[HISTORICO handleFiltrarClick] Filtrando de ${dataInicioFiltro} a ${dataFimFiltro} com pesquisa: "${termoPesquisa}"`);
    fetchHistorico(dataInicioFiltro, dataFimFiltro, termoPesquisa);
  };

  // --- Cálculos de Totais ---
  const totalReceitas = lancamentos
    .filter(item => item.tipo_de_operacao === 'Receita')
    .reduce((acc, item) => acc + parseFloat(item.valor_r || 0), 0);
  const totalDespesas = lancamentos
    .filter(item => item.tipo_de_operacao === 'Despesa')
    .reduce((acc, item) => acc + parseFloat(item.valor_r || 0), 0);

  // --- Função para Renderizar Linha ---
  const renderLinha = (item) => (
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
    // Não mostra nada se a unidade não estiver selecionada OU se houver erro E não estiver loading
    if (!unidadeId) { return <p className="historico-mensagem">Por favor, selecione uma unidade.</p>; }
    if (error && !isLoading) { return <p className="historico-mensagem erro">{error}</p>; }
    // Se não houver lançamentos E não estiver loading E não houver erro, mostra mensagem de vazio
    if (lancamentos.length === 0 && !isLoading && !error) {
        return <p className="historico-mensagem">Nenhum lançamento encontrado para o período e pesquisa selecionados.</p>;
    }
    // Se chegou aqui e está a carregar, não mostramos nada (o loading global trata disso)
    // Se chegou aqui e tem lançamentos, calculamos e mostramos

    const receitasDoPeriodo = lancamentos.filter(item => item.tipo_de_operacao === 'Receita');
    const despesasDoPeriodo = lancamentos.filter(item => item.tipo_de_operacao === 'Despesa');

    return (
      <>
        {/* Secção Receitas */}
        <div className="resumo-seccao" onClick={() => setMostrarReceitas(!mostrarReceitas)} role="button" tabIndex={0}>
          <h3>{mostrarReceitas ? '▼' : '►'} Total Receitas ({formatarData(dataInicioFiltro)} a {formatarData(dataFimFiltro)}):</h3>
          <span className="valor-receita">{formatarValor(totalReceitas)}</span>
        </div>
        {mostrarReceitas && ( receitasDoPeriodo.length > 0 ? ( <div className="detalhe-tabela-wrapper"> <table className="tabela-lancamentos detalhe"><thead><tr><th>Data Pag.</th><th>Descrição</th><th style={{ textAlign: 'right' }}>Valor</th></tr></thead><tbody>{receitasDoPeriodo.map(renderLinha)}</tbody></table></div> ) : ( <p className="historico-mensagem detalhe">Nenhuma receita encontrada no período.</p> ) )}

        {/* Secção Despesas */}
        <div className="resumo-seccao" onClick={() => setMostrarDespesas(!mostrarDespesas)} role="button" tabIndex={0}>
          <h3>{mostrarDespesas ? '▼' : '►'} Total Despesas ({formatarData(dataInicioFiltro)} a {formatarData(dataFimFiltro)}):</h3>
          <span className="valor-despesa">{formatarValor(totalDespesas)}</span>
        </div>
        {mostrarDespesas && ( despesasDoPeriodo.length > 0 ? ( <div className="detalhe-tabela-wrapper"> <table className="tabela-lancamentos detalhe"><thead><tr><th>Data Pag.</th><th>Descrição</th><th style={{ textAlign: 'right' }}>Valor</th></tr></thead><tbody>{despesasDoPeriodo.map(renderLinha)}</tbody></table></div> ) : ( <p className="historico-mensagem detalhe">Nenhuma despesa encontrada no período.</p> ) )}
      </>
    );
  };

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
      {/* Mostra 'A carregar...' globalmente apenas durante a busca */}
      {isLoading && <p className="historico-mensagem">A carregar...</p>}
      {/* Renderiza o conteúdo (totais/tabelas OU mensagens de erro/vazio) apenas se NÃO estiver loading */}
      {!isLoading && renderHistorico()}
    </div>
  );
} // ***** FIM DO COMPONENTE HistoricoLancamentos *****

export default HistoricoLancamentos;