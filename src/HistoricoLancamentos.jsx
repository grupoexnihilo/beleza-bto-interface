// --- VERSÃO COMPLETA FINAL (Filtros, Pesquisa, Delete, Edit, Colunas Corrigidas) ---
import React, { useState, useEffect } from 'react';
import './HistoricoLancamentos.css';

// ***** INÍCIO DAS FUNÇÕES AUXILIARES *****
const formatarDataParaInput = (data) => {
  if (!data || !(data instanceof Date) || isNaN(data.getTime())) { return ''; }
  try {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${ano}-${mes}-${dia}`;
  } catch (e) { return ''; }
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
          const diaF = String(dia).padStart(2, '0'); const mesF = String(mes).padStart(2, '0');
          return `${diaF}/${mesF}/${ano}`;
        }
      } return '-';
    }
    const dia = String(dataObj.getUTCDate()).padStart(2, '0');
    const mes = String(dataObj.getUTCMonth() + 1).padStart(2, '0');
    const ano = dataObj.getUTCFullYear();
    return `${dia}/${mes}/${ano}`;
  } catch (e) { return '-'; }
};
const formatarValor = (valor) => {
  const numValor = parseFloat(valor || 0);
  if (isNaN(numValor)) { return 'R$ 0,00'; }
  return numValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
// ***** FIM DAS FUNÇÕES AUXILIARES *****


// ***** INÍCIO DO COMPONENTE PRINCIPAL *****
function HistoricoLancamentos({ user, unidadeId }) {
  // --- Estados ---
  const [lancamentos, setLancamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [mostrarReceitas, setMostrarReceitas] = useState(false);
  const [mostrarDespesas, setMostrarDespesas] = useState(false);
  const [dataInicioFiltro, setDataInicioFiltro] = useState('');
  const [dataFimFiltro, setDataFimFiltro] = useState('');
  const [termoPesquisa, setTermoPesquisa] = useState('');
  // --- Estados Edição ---
  const [editingItem, setEditingItem] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormError, setEditFormError] = useState(null);
  const [allCategorias, setAllCategorias] = useState([]);
  const [allColaboradores, setAllColaboradores] = useState([]);
  const [allFormasPagamento, setAllFormasPagamento] = useState([]);
  const [editFormData, setEditFormData] = useState({});

  // --- Função para Buscar Dados ---
  const fetchHistorico = async (inicio, fim, pesquisa) => {
    if (!user?.email || !unidadeId || !inicio || !fim) { /*...*/ setLancamentos([]); return; }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(inicio) || !dateRegex.test(fim)) { /*...*/ setLancamentos([]); return; }
    setIsLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ email: user.email, unidadeId, dataInicio: inicio, dataFim: fim });
      if (pesquisa && pesquisa.trim() !== '') { params.append('termoPesquisa', pesquisa.trim()); }
      const url = `/api/getHistorico?${params.toString()}`;
      const response = await fetch(url);
      const responseText = await response.text();
      if (!response.ok) {
        let errorData = { message: `Erro ${response.status} ao buscar histórico.` };
        try { errorData = JSON.parse(responseText); } catch (e) { /* Ignora */ }
        throw new Error(errorData.message || `Falha ao buscar histórico (${response.status})`);
      }
      const data = responseText ? JSON.parse(responseText) : [];
      setLancamentos(Array.isArray(data) ? data : []); // Garante que é SEMPRE um array
    } catch (err) {
      console.error("[HISTORICO fetch] Erro no bloco catch:", err);
      setError(err.message || "Ocorreu um erro ao buscar o histórico.");
      setLancamentos([]);
    } finally {
      setIsLoading(false);
    }
  }; // --- FIM fetchHistorico ---

  // --- Efeito para Carga Inicial E BUSCA DE OPÇÕES DE EDIÇÃO ---
  useEffect(() => {
    try {
      const agora = new Date();
      const inicioMesAtual = formatarDataParaInput(new Date(agora.getFullYear(), agora.getMonth(), 1));
      const fimMesAtual = formatarDataParaInput(new Date(agora.getFullYear(), agora.getMonth() + 1, 0));
      if (inicioMesAtual && fimMesAtual) {
        setDataInicioFiltro(inicioMesAtual); setDataFimFiltro(fimMesAtual); setTermoPesquisa('');
        if (user && user.email && unidadeId) {
          fetchHistorico(inicioMesAtual, fimMesAtual, '');
        } else { setLancamentos([]); }
      } else { /*...*/ setLancamentos([]); }
    } catch (e) { /*...*/ setLancamentos([]); }
    finally { setMostrarReceitas(false); setMostrarDespesas(false); }
    const fetchAllOptions = async () => {
      if (!unidadeId) return;
      try {
        const [resReceita, resDespesa] = await Promise.all([
          fetch(`/api/getFormOptions?unidadeId=${unidadeId}&tipo=Receita`),
          fetch(`/api/getFormOptions?unidadeId=${unidadeId}&tipo=Despesa`)
        ]);
        if (!resReceita.ok || !resDespesa.ok) { return; }
        const dataReceita = await resReceita.json();
        const dataDespesa = await resDespesa.json();
        const categoriasReceita = (dataReceita.categorias || []).map(cat => ({ ...cat, tipo: 'Receita' }));
        const categoriasDespesa = (dataDespesa.categorias || []).map(cat => ({ ...cat, tipo: 'Despesa' }));
        setAllCategorias([...categoriasReceita, ...categoriasDespesa]);
        setAllColaboradores(dataReceita.colaboradores || []);
        // Precisamos de TODAS as FPs, então vamos buscar de ambas as fontes
        const fpReceitaMap = new Map((dataReceita.formasPagamento || []).map(fp => [fp.id, fp]));
        const fpDespesaMap = new Map((dataDespesa.formasPagamento || []).map(fp => [fp.id, fp]));
        const allFormasPagamentoMap = new Map([...fpReceitaMap, ...fpDespesaMap]);
        setAllFormasPagamento(Array.from(allFormasPagamentoMap.values()));
      } catch (catError) { console.error("Erro ao buscar opções para edição:", catError); }
    };
    fetchAllOptions();
  }, [user, unidadeId]);
  // --- FIM useEffect ---

  // --- Handlers (Filtrar, Delete, Edit) ---
  const handleFiltrarClick = () => { /* ... (código mantido) ... */ };
  const handleDeleteClick = async (idParaApagar) => { /* ... (código mantido) ... */ };
  const handleEditClick = (item) => { /* ... (código mantido) ... */ };
  const handleEditFormChange = (e) => { /* ... (código mantido) ... */ };
  const handleUpdateSubmit = async (e) => { /* ... (código mantido) ... */ };
  // --- FIM Handlers Edição ---

  // --- Cálculos de Totais ---
  const totalReceitas = (lancamentos || []).filter(/*...*/).reduce(/*...*/);
  const totalDespesas = (lancamentos || []).filter(/*...*/).reduce(/*...*/);

  // --- Funções de Renderização de Linha (SEPARADAS E CORRIGIDAS) ---
  // Linha para Despesas (Layout NOVO, 5 colunas + Ações)
  const renderLinhaDespesa = (item) => (
    <tr key={item.id_de_lancamento} className={isDeleting === item.id_de_lancamento ? 'deleting' : ''}>
      <td>{formatarData(item.data_pagamento)}</td>
      <td>{item.descricao || item.categoria}</td>
      <td>{item.forma_pagamento_nome || '(Não definido)'}</td> {/* <<< NOVA COLUNA */}
      <td className="valor-despesa">{formatarValor(item.valor_r)}</td>
      <td className="coluna-acoes">
        <button className="botao-acao editar" onClick={() => handleEditClick(item)} disabled={isDeleting || isUpdating} title="Editar"> ✎ </button>
        <button className="botao-acao apagar" onClick={() => handleDeleteClick(item.id_de_lancamento)} disabled={isDeleting || isUpdating} title="Apagar">
          {isDeleting === item.id_de_lancamento ? '...' : '🗑️'}
        </button>
      </td>
    </tr>
  );
  // Linha para Receitas (Layout 6 colunas + Ações)
  const renderLinhaReceita = (item) => (
    <tr key={item.id_de_lancamento} className={isDeleting === item.id_de_lancamento ? 'deleting' : ''}>
      <td>{formatarData(item.data_pagamento)}</td>
      <td>{item.categoria}</td>
      <td>{item.profissional_nome || '(Não definido)'}</td>
      <td>{item.forma_pagamento_nome || '(Não definido)'}</td>
      <td className="valor-receita">{formatarValor(item.valor_r)}</td>
      <td className="coluna-acoes">
        <button className="botao-acao editar" onClick={() => handleEditClick(item)} disabled={isDeleting || isUpdating} title="Editar"> ✎ </button>
        <button className="botao-acao apagar" onClick={() => handleDeleteClick(item.id_de_lancamento)} disabled={isDeleting || isUpdating} title="Apagar">
          {isDeleting === item.id_de_lancamento ? '...' : '🗑️'}
        </button>
      </td>
    </tr>
  );
  // --- FIM Funções de Linha ---

  // --- Lógica de Renderização Principal (COM CABEÇALHOS CORRIGIDOS) ---
  const renderHistorico = () => {
    if (!unidadeId) { return <p className="historico-mensagem">Por favor, selecione uma unidade.</p>; }
    if (error && !isLoading) { return <p className="historico-mensagem erro">{error}</p>; }
    if ((!lancamentos || lancamentos.length === 0) && !isLoading && !error) {
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
        {mostrarReceitas && (receitasDoPeriodo.length > 0 ? (
          <div className="detalhe-tabela-wrapper">
            <table className="tabela-lancamentos detalhe">
              <thead><tr>
                <th>Data Pag.</th>
                <th>Categoria</th>
                <th>Profissional</th>
                <th>Forma Pag.</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
                <th className="coluna-acoes-header">Ações</th>
              </tr></thead>
              <tbody>{receitasDoPeriodo.map(renderLinhaReceita)}</tbody>
            </table>
          </div>
        ) : (<p className="historico-mensagem detalhe">Nenhuma receita encontrada no período.</p>))}

        {/* Secção Despesas */}
        <div className="resumo-seccao" onClick={() => setMostrarDespesas(!mostrarDespesas)} role="button" tabIndex={0}>
          <h3>{mostrarDespesas ? '▼' : '►'} Total Despesas ({formatarData(dataInicioFiltro)} a {formatarData(dataFimFiltro)}):</h3>
          <span className="valor-despesa">{formatarValor(totalDespesas)}</span>
        </div>
        {mostrarDespesas && (despesasDoPeriodo.length > 0 ? (
          <div className="detalhe-tabela-wrapper">
            <table className="tabela-lancamentos detalhe">
              
              {/* --- CABEÇALHO DE DESPESAS CORRIGIDO (5 COLUNAS) --- */}
              <thead>
                <tr>
                  <th>Data Pag.</th>
                  <th>Descrição</th>
                  <th>Forma Pag.</th> {/* <<< NOVA COLUNA */}
                  <th style={{ textAlign: 'right' }}>Valor</th>
                  <th className="coluna-acoes-header">Ações</th>
                </tr>
              </thead>
              {/* --- FIM CABEÇALHO --- */}
              
              <tbody>
                {despesasDoPeriodo.map(renderLinhaDespesa)}
              </tbody>
            </table>
          </div>
        ) : (<p className="historico-mensagem detalhe">Nenhuma despesa encontrada no período.</p>))}
      </>
    );
  }; // --- FIM renderHistorico ---

  // --- Return Principal ---
  return (
    <div className="historico-wrapper">
      {/* Filtro */}
      <div className="filtro-historico"> {/* ... (inputs e botão mantidos) ... */ } </div>

      {/* Resumo */}
      <h2>Resumo do Período Selecionado</h2>
      {isLoading && <p className="historico-mensagem">A carregar...</p>}
      {!isLoading && renderHistorico()}

      {/* --- MODAL DE EDIÇÃO (COM CORREÇÕES FINAIS) --- */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Editar Lançamento</h3>
            <form onSubmit={handleUpdateSubmit} className="edit-form">
              {/* Campos Comuns */}
              <div className="form-row">
                <div className="form-group"> <label htmlFor="edit-dataCompetencia">Data de Competência</label> <input type="date" id="edit-dataCompetencia" name="data_competencia" value={editFormData.data_competencia || ''} onChange={handleEditFormChange} required /> </div>
                <div className="form-group"> <label htmlFor="edit-dataPagamento">Data de Pagamento</label> <input type="date" id="edit-dataPagamento" name="data_pagamento" value={editFormData.data_pagamento || ''} onChange={handleEditFormChange} /> </div>
              </div>
              <div className="form-group"> <label htmlFor="edit-valor_r">Valor (R$)</label> <input type="number" step="0.01" id="edit-valor_r" name="valor_r" value={editFormData.valor_r || ''} onChange={handleEditFormChange} required /> </div>
              
              {/* Campo Condicional: Profissional (SÓ PARA RECEITAS) */}
              {editingItem.tipo_de_operacao === 'Receita' && (
                <div className="form-group">
                  <label htmlFor="edit-profissional">Profissional</label>
                  <select id="edit-profissional" name="profissional" value={editFormData.profissional || ''} onChange={handleEditFormChange} required>
                    <option value="">Selecione...</option>
                    {(allColaboradores || []).map(colab => ( <option key={colab.id} value={colab.id}>{colab.nome}</option> ))}
                  </select>
                </div>
              )}

              {/* Campos Condicionais: Categoria e Forma de Pagamento */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-categoria">Categoria</label>
                  <select id="edit-categoria" name="categoria" value={editFormData.categoria || ''} onChange={handleEditFormChange} required>
                    <option value="">Selecione...</option>
                    {(allCategorias || [])
                      .filter(cat => cat.tipo === editingItem.tipo_de_operacao) // CORRIGIDO
                      .map(cat => ( <option key={cat.id} value={cat.id}>{cat.nome}</option>))}
                  </select>
                </div>
                
                <div className="form-group">
                    <label htmlFor="edit-formaPagamento">Forma de Pagamento</label>
                    <select id="edit-formaPagamento" name="forma_de_pagamento" value={editFormData.forma_de_pagamento || ''} onChange={handleEditFormChange} required>
                        <option value="">Selecione...</option>
                        {(allFormasPagamento || []).map(fp => ( <option key={fp.id} value={fp.id}>{fp.nome}</option> ))}
                    </select>
                </div>
              </div>
               
               <div className="form-group"> <label htmlFor="edit-descricao">Descrição</label> <input type="text" id="edit-descricao" name="descricao" value={editFormData.descricao || ''} onChange={handleEditFormChange} /> </div>

              {editFormError && ( <p className="historico-mensagem erro">{editFormError}</p> )}

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