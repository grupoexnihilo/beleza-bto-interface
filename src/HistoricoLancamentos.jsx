// --- VERSÃO COMPLETA FINAL E CORRIGIDA ---
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
      // Se falhar, tenta interpretar como YYYY-MM-DD (caso venha do input do filtro)
      const parts = dataInput.split('-');
      if (parts.length === 3) {
          const [ano, mes, dia] = parts;
          // Verifica se as partes são numéricas antes de retornar
          if (!isNaN(parseInt(dia)) && !isNaN(parseInt(mes)) && !isNaN(parseInt(ano))) {
              // Garante 2 dígitos para dia e mês
              const diaF = String(dia).padStart(2, '0');
              const mesF = String(mes).padStart(2, '0');
              return `${diaF}/${mesF}/${ano}`;
          }
      }
      console.warn("Formato de data inválido recebido:", dataInput);
      return '-'; // Retorna '-' se a data for inválida
    }

    // Extrai dia, mês e ano usando métodos UTC para garantir consistência com a exibição UTC
    const dia = String(dataObj.getUTCDate()).padStart(2, '0');
    const mes = String(dataObj.getUTCMonth() + 1).padStart(2, '0'); // Mês UTC é base 0
    const ano = dataObj.getUTCFullYear();

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
  const [dataInicioFiltro, setDataInicioFiltro] = useState(''); // Inicializa vazio
  const [dataFimFiltro, setDataFimFiltro] = useState('');     // Inicializa vazio
  const [termoPesquisa, setTermoPesquisa] = useState('');

  // --- Função para Buscar Dados (SINTAXE REVISADA) ---
  const fetchHistorico = async (inicio, fim, pesquisa) => {
    // Validação robusta dos parâmetros
    if (!user?.email || !unidadeId || !inicio || !fim ) {
        console.warn("[HISTORICO fetch] Parâmetros inválidos. Abortando.", { email: user?.email, unidadeId, inicio, fim });
        setError("Erro: Dados do utilizador, unidade ou período inválidos para a busca.");
        setLancamentos([]);
        setIsLoading(false);
        return; // Termina a execução se inválido
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(inicio) || !dateRegex.test(fim)) {
        console.warn("[HISTORICO fetch] Formato de data inválido para API. Abortando.", { inicio, fim });
        setError("Formato de data inválido para filtro (use AAAA-MM-DD).");
        setLancamentos([]);
        setIsLoading(false);
        return; // Termina a execução se inválido
    }

    setIsLoading(true);
    setError(null); // Limpa erro anterior
    try {
      const params = new URLSearchParams({ email: user.email, unidadeId, dataInicio: inicio, dataFim: fim });
      if (pesquisa && pesquisa.trim() !== '') {
        params.append('termoPesquisa', pesquisa.trim());
      }
      const url = `/api/getHistorico?${params.toString()}`;
      console.log(`[HISTORICO fetch] Buscando URL: ${url}`); // Log URL

      const response = await fetch(url); // Executa o fetch
      const responseText = await response.text(); // Lê como texto
      console.log(`[HISTORICO fetch] Status: ${response.status}. Resposta Texto (inicio): ${responseText.substring(0,100)}...`); // Log Status/Texto

      // Verifica se a resposta foi OK (status 2xx)
      if (!response.ok) {
        let errorData = { message: `Erro ${response.status} ao buscar histórico.` };
        try { errorData = JSON.parse(responseText); } catch (e) { /* Ignora erro de parse */ }
        console.error("[HISTORICO fetch] Erro na resposta da API:", errorData); // Log do erro da API
        throw new Error(errorData.message || `Falha ao buscar histórico (${response.status})`);
      }

      // Se OK, tenta analisar como JSON
      const data = JSON.parse(responseText);
      console.log("[HISTORICO fetch] Dados JSON recebidos:", data); // Log dos dados
      setLancamentos(data); // Atualiza o estado

    } catch (err) {
      console.error("[HISTORICO fetch] Erro no bloco catch:", err); // Log de erro JS
      setError(err.message || "Ocorreu um erro ao buscar o histórico.");
      setLancamentos([]); // Limpa em caso de erro
    } finally {
      setIsLoading(false); // Garante que loading termina
    }
  }; // <<< FIM DA FUNÇÃO fetchHistorico (Verifique o ';')
  // --- FIM FUNÇÃO fetchHistorico ---

  // --- Efeito para Carga Inicial (SINTAXE REVISADA) ---
  useEffect(() => {
    console.log(`[HISTORICO useEffect inicial] User ou Unidade mudou.`);
    try { // Adicionado try...catch robusto para cálculo de datas
        const agora = new Date();
        const inicioMesAtual = formatarDataParaInput(new Date(agora.getFullYear(), agora.getMonth(), 1));
        const fimMesAtual = formatarDataParaInput(new Date(agora.getFullYear(), agora.getMonth() + 1, 0));

        // Verifica se as datas calculadas são válidas ANTES de usá-las
        if (inicioMesAtual && fimMesAtual) {
            console.log(`[HISTORICO useEffect inicial] Definindo e buscando datas: ${inicioMesAtual} a ${fimMesAtual}`);
            setDataInicioFiltro(inicioMesAtual);
            setDataFimFiltro(fimMesAtual);
            setTermoPesquisa(''); // Limpa pesquisa

            // Chama fetchHistorico APENAS se user e unidadeId já estiverem prontos
            if (user && user.email && unidadeId) {
                fetchHistorico(inicioMesAtual, fimMesAtual, ''); // Busca inicial
            } else {
                 console.log("[HISTORICO useEffect inicial] User ou UnidadeId ainda não definidos, aguardando.");
                 setLancamentos([]); // Garante vazio
            }
        } else {
            // Se formatarDataParaInput retornou vazio (data inválida)
            console.error("[HISTORICO useEffect inicial] Erro ao calcular datas do mês atual (resultado vazio).");
            setError("Erro ao definir período inicial.");
            setLancamentos([]);
        }
    } catch (e) { // Captura erros inesperados no cálculo das datas
        console.error("[HISTORICO useEffect inicial] Erro GERAL inesperado ao calcular datas:", e);
        setError("Erro crítico ao definir período.");
        setLancamentos([]);
    } finally {
        // Garante que estados visuais sejam resetados
        setMostrarReceitas(false);
        setMostrarDespesas(false);
    }
  }, [user, unidadeId]); // <<< FIM DO useEffect (Verifique o ';')
  // --- FIM DO useEffect ---


  // --- Handler do Botão Filtrar ---
  const handleFiltrarClick = () => {
    if (!dataInicioFiltro || !dataFimFiltro) {
        setError("Por favor, selecione as datas de início e fim.");
        return;
    }
    // Converte as datas para objetos Date para comparação segura
    const inicio = new Date(dataInicioFiltro + 'T00:00:00Z'); // Assume UTC
    const fim = new Date(dataFimFiltro + 'T23:59:59Z'); // Assume UTC fim do dia
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
        setError("Datas selecionadas são inválidas.");
        return;
    }
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
    </tr>
  );

  // --- Lógica de Renderização Principal ---
  const renderHistorico = () => {
    if (!unidadeId) { return <p className="historico-mensagem">Por favor, selecione uma unidade.</p>; }
    if (error && !isLoading) { return <p className="historico-mensagem erro">{error}</p>; }
    if (lancamentos.length === 0 && !isLoading && !error) {
        return <p className="historico-mensagem">Nenhum lançamento encontrado para o período e pesquisa selecionados.</p>;
    }
    // Não renderiza nada se estiver loading (a mensagem global trata disso)
    if (isLoading) { return null; }


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
      {isLoading && <p className="historico-mensagem">A carregar...</p>}
      {!isLoading && renderHistorico()}
    </div>
  );
} // ***** FIM DO COMPONENTE HistoricoLancamentos *****

export default HistoricoLancamentos;