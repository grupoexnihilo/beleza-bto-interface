// --- VERSÃO COMPLETA FINAL (Filtros + Pesquisa + Delete + Edit + Syntax Fix) ---
import React, { useState, useEffect } from 'react';
import './HistoricoLancamentos.css';

// ***** INÍCIO DAS FUNÇÕES AUXILIARES (DEFINIDAS ANTES DO COMPONENTE) *****
// (Garante que não há erros de "função não definida")

// Formata Data (Date object) para YYYY-MM-DD
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

// Formata Data (String ISO ou YYYY-MM-DD) para DD/MM/YYYY
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

// Formata número para R$
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
  const [isDeleting, setIsDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [mostrarReceitas, setMostrarReceitas] = useState(false);
  const [mostrarDespesas, setMostrarDespesas] = useState(false);
  const [dataInicioFiltro, setDataInicioFiltro] = useState('');
  const [dataFimFiltro, setDataFimFiltro] = useState('');
  const [termoPesquisa, setTermoPesquisa] = useState('');

  // --- Estados para Edição ---
  const [editingItem, setEditingItem] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormError, setEditFormError] = useState(null);
  const [allCategorias, setAllCategorias] = useState([]);
  const [editFormData, setEditFormData] = useState({});

  // --- Função para Buscar Dados ---
  const fetchHistorico = async (inicio, fim, pesquisa) => {
    if (!user?.email || !unidadeId || !inicio || !fim) {
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
      console.log(`[HISTORICO fetch] Status: ${response.status}. Resposta Texto (inicio): ${responseText.substring(0, 100)}...`);

      if (!response.ok) {
        let errorData = { message: `Erro ${response.status} ao buscar histórico.` };
        try { errorData = JSON.parse(responseText); } catch (e) { /* Ignora */ }
        throw new Error(errorData.message || `Falha ao buscar histórico (${response.status})`);
      }
      const data = responseText ? JSON.parse(responseText) : [];
      console.log("[HISTORICO fetch] Dados JSON recebidos:", data);
      setLancamentos(Array.isArray(data) ? data : []); // Garante que é SEMPRE um array
    } catch (err) {
      console.error("[HISTORICO fetch] Erro no bloco catch:", err);
      setError(err.message || "Ocorreu um erro ao buscar o histórico.");
      setLancamentos([]);
    } finally {
      setIsLoading(false);
    }
  }; // --- FIM fetchHistorico ---

  // --- Efeito para Carga Inicial E BUSCA DE CATEGORIAS ---
  useEffect(() => {
    console.log(`[HISTORICO useEffect inicial] User ou Unidade mudou.`);
    try {
      const agora = new Date();
      const inicioMesAtual = formatarDataParaInput(new Date(agora.getFullYear(), agora.getMonth(), 1));
      const fimMesAtual = formatarDataParaInput(new Date(agora.getFullYear(), agora.getMonth() + 1, 0));

      if (inicioMesAtual && fimMesAtual) {
        setDataInicioFiltro(inicioMesAtual); setDataFimFiltro(fimMesAtual); setTermoPesquisa('');
        if (user && user.email && unidadeId) {
          fetchHistorico(inicioMesAtual, fimMesAtual, '');
        } else { setLancamentos([]); }
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

    // Buscar TODAS as categorias para o modal de edição
    const fetchAllCategorias = async () => {
      if (!unidadeId) return;
      console.log("[HISTORICO useEffect] Buscando todas as categorias para o modal...");
      try {
        const [resReceita, resDespesa] = await Promise.all([
          fetch(`/api/getFormOptions?unidadeId=${unidadeId}&tipo=Receita`),
          fetch(`/api/getFormOptions?unidadeId=${unidadeId}&tipo=Despesa`)
        ]);
        if (!resReceita.ok || !resDespesa.ok) {
          console.error("Falha ao buscar uma ou mais listas de categorias.");
          return;
        }
        const dataReceita = await resReceita.json();
        const dataDespesa = await resDespesa.json();

        // Adiciona a propriedade 'tipo' correta (baseado no que a API 'getFormOptions' usa)
        // A API já usa 'tipo: Receita' e 'tipo: Despesa' no filtro, mas não adiciona
        // a propriedade ao objeto retornado. Vamos buscar pela coluna 'operacao' ou 'tipo'
        // que deve existir em 'cat'
        const categoriasReceita = (dataReceita.categorias || []).map(cat => ({ ...cat, tipo: 'Receita' }));
        const categoriasDespesa = (dataDespesa.categorias || []).map(cat => ({ ...cat, tipo: 'Despesa' }));

        setAllCategorias([...categoriasReceita, ...categoriasDespesa]);
        console.log("[HISTORICO useEffect] Todas as categorias carregadas.");
      } catch (catError) {
        console.error("Erro ao buscar todas as categorias para edição:", catError);
      }
    }; // Fim fetchAllCategorias

    fetchAllCategorias(); // Chama a função

  }, [user, unidadeId]); // --- FIM useEffect ---

  // --- Handlers ---
  const handleFiltrarClick = () => {
    if (!dataInicioFiltro || !dataFimFiltro) {
      setError("Por favor, selecione as datas de início e fim.");
      return;
    }
    const inicio = new Date(dataInicioFiltro + 'T00:00:00Z');
    const fim = new Date(dataFimFiltro + 'T23:59:59Z');
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
  }; // Fim handleFiltrarClick

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
      setLancamentos(listaAtual => listaAtual.filter(item => item.id_de_lancamento !== idParaApagar));
      console.log(`[HISTORICO handleDelete] Lançamento ${idParaApagar} apagado.`);
    } catch (err) {
      console.error("[HISTORICO handleDelete] Erro:", err);
      setError(err.message || "Ocorreu um erro ao apagar.");
    } finally {
      setIsDeleting(null);
    }
  }; // Fim handleDeleteClick

  const handleEditClick = (item) => {
    console.log("Iniciando edição para:", item);
    // Formata datas ISO (do Neon) para YYYY-MM-DD (para o input)
    const dataCompFormatada = item.data_competencia ? formatarData(item.data_competencia).split('/').reverse().join('-') : '';
    const dataPagFormatada = item.data_pagamento ? formatarData(item.data_pagamento).split('/').reverse().join('-') : '';
    
    const itemFormatado = {
      ...item,
      data_competencia: dataCompFormatada,
      data_pagamento: dataPagFormatada,
    };
    setEditFormData(itemFormatado);
    setEditingItem(itemFormatado);
    setEditFormError(null);
  }; // Fim handleEditClick

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  }; // Fim handleEditFormChange

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setEditFormError(null);
    
    // Converte datas YYYY-MM-DD (do form) para ISOString UTC (para a API)
    const dataCompetenciaUTC = editFormData.data_competencia ? new Date(editFormData.data_competencia + 'T00:00:00.000Z').toISOString() : null;
    const dataPagamentoFinal = editFormData.data_pagamento || editFormData.data_competencia;
    const dataPagamentoUTC = dataPagamentoFinal ? new Date(dataPagamentoFinal + 'T00:00:00.000Z').toISOString() : null;

    const updatePayload = {
      id_de_lancamento: editingItem.id_de_lancamento,
      dataCompetencia: dataCompetenciaUTC, // Envia ISOString
      dataPagamento: dataPagamentoUTC,   // Envia ISOString
      categoria: editFormData.categoria,
      descricao: editFormData.descricao,
      valor_r: editFormData.valor_r,
      profissional: editingItem.profissional || null,
      formaPagamento: editingItem.forma_de_pagamento || null
    };

    try {
      const response = await fetch('/api/updateLancamento', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
      const data = await response.json(); // Tenta ler JSON
      if (!response.ok) {
        throw new Error(data.message || 'Falha ao atualizar lançamento.');
      }
      console.log("Atualização bem-sucedida:", data);
      
      // Atualiza a lista local com os dados *retornados* pela API (que incluem o 'grupo' recalculado)
      setLancamentos(prevLancamentos =>
        prevLancamentos.map(lanc =>
          lanc.id_de_lancamento === data.id_de_lancamento ? data : lanc
        )
      );
      setEditingItem(null); // Fecha o modal
    } catch (err) {
      console.error("Erro ao atualizar:", err);
      setEditFormError(err.message);
    } finally {
      setIsUpdating(false);
    }
  }; // Fim handleUpdateSubmit

  // --- Cálculos de Totais ---
  const totalReceitas = (lancamentos || [])
    .filter(item => item.tipo_de_operacao === 'Receita')
    .reduce((acc, item) => acc + parseFloat(item.valor_r || 0), 0);
  const totalDespesas = (lancamentos || [])
    .filter(item => item.tipo_de_operacao === 'Despesa')
    .reduce((acc, item) => acc + parseFloat(item.valor_r || 0), 0);

  // --- Função para Renderizar Linha ---
  const renderLinha = (item) => (
    <tr key={item.id_de_lancamento} className={isDeleting === item.id_de_lancamento ? 'deleting' : ''}>
      <td>{formatarData(item.data_pagamento)}</td>
      <td>{item.descricao || item.categoria}</td>
      <td className={`valor-${item.tipo_de_operacao?.toLowerCase()}`}>
        {formatarValor(item.valor_r)}
      </td>
      <td className="coluna-acoes">
        <button className="botao-acao editar" onClick={() => handleEditClick(item)} disabled={isDeleting || isUpdating} title="Editar"> ✎ </button>
        <button className="botao-acao apagar" onClick={() => handleDeleteClick(item.id_de_lancamento)} disabled={isDeleting || isUpdating} title="Apagar">
          {isDeleting === item.id_de_lancamento ? '...' : '🗑️'}
        </button>
      </td>
    </tr>
  ); // Fim renderLinha

  // --- Lógica de Renderização Principal ---
  const renderHistorico = () => {
    if (!unidadeId) { return <p className="historico-mensagem">Por favor, selecione uma unidade.</p>; }
    if (error && !isLoading) { return <p className="historico-mensagem erro">{error}</p>; }
    if (lancamentos.length === 0 && !isLoading && !error) {
      return <p className="historico-mensagem">Nenhum lançamento encontrado para o período e pesquisa selecionados.</p>;
    }
    if (isLoading && (!lancamentos || lancamentos.length === 0)) { return null; }

    const receitasDoPeriodo = (lancamentos || []).filter(item => item.tipo_de_operacao === 'Receita');
    const despesasDoPeriodo = (lancamentos || []).filter(item => item.tipo_de_operacao === 'Despesa');

    return (
      <>
        {/* Secção Receitas */}
        <div className="resumo-seccao" onClick={() => setMostrarReceitas(!mostrarReceitas)} role="button" tabIndex={0}>
          <h3>{mostrarReceitas ? '▼' : '►'} Total Receitas ({formatarData(dataInicioFiltro)} a {formatarData(dataFimFiltro)}):</h3>
          <span className="valor-receita">{formatarValor(totalReceitas)}</span>
        </div>
        {mostrarReceitas && (receitasDoPeriodo.length > 0 ? (<div className="detalhe-tabela-wrapper"> <table className="tabela-lancamentos detalhe"><thead><tr><th>Data Pag.</th><th>Descrição</th><th style={{ textAlign: 'right' }}>Valor</th><th className="coluna-acoes-header">Ações</th></tr></thead><tbody>{receitasDoPeriodo.map(renderLinha)}</tbody></table></div>) : (<p className="historico-mensagem detalhe">Nenhuma receita encontrada no período.</p>))}

        {/* Secção Despesas */}
        <div className="resumo-seccao" onClick={() => setMostrarDespesas(!mostrarDespesas)} role="button" tabIndex={0}>
          <h3>{mostrarDespesas ? '▼' : '►'} Total Despesas ({formatarData(dataInicioFiltro)} a {formatarData(dataFimFiltro)}):</h3>
          <span className="valor-despesa">{formatarValor(totalDespesas)}</span>
        </div>
        {mostrarDespesas && (despesasDoPeriodo.length > 0 ? (<div className="detalhe-tabela-wrapper"> <table className="tabela-lancamentos detalhe"><thead><tr><th>Data Pag.</th><th>Descrição</th><th style={{ textAlign: 'right' }}>Valor</th><th className="coluna-acoes-header">Ações</th></tr></thead><tbody>{despesasDoPeriodo.map(renderLinha)}</tbody></table></div>) : (<p className="historico-mensagem detalhe">Nenhuma despesa encontrada no período.</p>))}
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

      {/* --- MODAL DE EDIÇÃO (COM CORREÇÕES DE SINTAXE) --- */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Editar Lançamento</h3>
            <form onSubmit={handleUpdateSubmit} className="edit-form">
              <div className="form-group"> <label htmlFor="edit-dataCompetencia">Data de Competência</label> <input type="date" id="edit-dataCompetencia" name="data_competencia" value={editFormData.data_competencia || ''} onChange={handleEditFormChange} required /> </div>
              <div className="form-group"> <label htmlFor="edit-dataPagamento">Data de Pagamento</label> <input type="date" id="edit-dataPagamento" name="data_pagamento" value={editFormData.data_pagamento || ''} onChange={handleEditFormChange} /> </div>
              <div className="form-group"> <label htmlFor="edit-valor_r">Valor (R$)</label> <input type="number" step="0.01" id="edit-valor_r" name="valor_r" value={editFormData.valor_r || ''} onChange={handleEditFormChange} required /> </div>
              
              <div className="form-group">
                <label htmlFor="edit-categoria">Categoria</label>
                <select id="edit-categoria" name="categoria" value={editFormData.categoria || ''} onChange={handleEditFormChange} required>
                  <option value="">Selecione...</option>
                  {(allCategorias || []) // Fallback para array vazio
                    .filter(cat => cat.tipo === editingItem.tipo_de_operacao) // CORRIGIDO (era 'operacao')
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>
              
               <div className="form-group"> <label htmlFor="edit-descricao">Descrição</label> <input type="text" id="edit-descricao" name="descricao" value={editFormData.descricao || ''} onChange={handleEditFormChange} /> </div>

              {editFormError && (
                <p className="historico-mensagem erro">{editFormError}</p>
              )}

              <div className="modal-actions">
                <button type="button" className="botao-cancelar" onClick={() => setEditingItem(null)} disabled={isUpdating}> Cancelar </button>
                <button type="submit" className="botao-salvar" disabled={isUpdating}> {isUpdating ? 'A Salvar...' : 'Salvar Alterações'} </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- FIM MODAL DE EDIÇÃO --- */}

    </div>
  );
} // ***** FIM DO COMPONENTE HistoricoLancamentos *****

export default HistoricoLancamentos;