// --- VERSÃO FINAL COM FILTROS, PESQUISA, DELETE E EDIT CONDICIONAL ---
import React, { useState, useEffect } from 'react';
import './HistoricoLancamentos.css';

// ***** INÍCIO DAS FUNÇÕES AUXILIARES (DEFINIDAS ANTES DO COMPONENTE) *****
const formatarDataParaInput = (data) => {
  // ... (código mantido como na última versão) ...
  if (!data || !(data instanceof Date) || isNaN(data.getTime())) { return ''; }
  try {
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      return `${ano}-${mes}-${dia}`;
  } catch (e) { return ''; }
};
const formatarData = (dataInput) => {
  // ... (código mantido como na última versão, com correção UTC) ...
  if (!dataInput || typeof dataInput !== 'string') return '-';
  try {
    const dataObj = new Date(dataInput);
    if (isNaN(dataObj.getTime())) { /* ... (lógica de fallback mantida) ... */ }
    const dia = String(dataObj.getUTCDate()).padStart(2, '0');
    const mes = String(dataObj.getUTCMonth() + 1).padStart(2, '0');
    const ano = dataObj.getUTCFullYear();
    return `${dia}/${mes}/${ano}`;
  } catch (e) { return '-'; }
};
const formatarValor = (valor) => {
  // ... (código mantido como na última versão) ...
  const numValor = parseFloat(valor || 0);
  if (isNaN(numValor)) { return 'R$ 0,00'; }
  return numValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
// ***** FIM DAS FUNÇÕES AUXILIARES *****


// ***** INÍCIO DO COMPONENTE PRINCIPAL *****
function HistoricoLancamentos({ user, unidadeId }) {
  // --- Estados Principais ---
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
  const [editingItem, setEditingItem] = useState(null); // Guarda o item {id, ...} a ser editado
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormError, setEditFormError] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  // Listas para popular os dropdowns do modal de edição
  const [allCategorias, setAllCategorias] = useState([]);
  const [allColaboradores, setAllColaboradores] = useState([]);
  const [allFormasPagamento, setAllFormasPagamento] = useState([]);
  // --- FIM Estados Edição ---

  // --- Função para Buscar Dados (mantida) ---
  const fetchHistorico = async (inicio, fim, pesquisa) => {
    // ... (código mantido como na última versão, com validações) ...
    if (!user?.email || !unidadeId || !inicio || !fim ) { /*...*/ setLancamentos([]); return; }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(inicio) || !dateRegex.test(fim)) { /*...*/ setLancamentos([]); return; }
    setIsLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ email: user.email, unidadeId, dataInicio: inicio, dataFim: fim });
      if (pesquisa && pesquisa.trim() !== '') { params.append('termoPesquisa', pesquisa.trim()); }
      const url = `/api/getHistorico?${params.toString()}`;
      const response = await fetch(url);
      const responseText = await response.text();
      if (!response.ok) { /*...*/ throw new Error(/*...*/); }
      const data = responseText ? JSON.parse(responseText) : [];
      setLancamentos(Array.isArray(data) ? data : []); // Garante que é SEMPRE um array
    } catch (err) { /*...*/ setError(err.message); setLancamentos([]); }
    finally { setIsLoading(false); }
  }; // --- FIM fetchHistorico ---

  // --- Efeito para Carga Inicial E BUSCA DE OPÇÕES DE EDIÇÃO ---
  useEffect(() => {
    // ... (Lógica de cálculo de datas e busca inicial do histórico mantida) ...
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

    // --- Buscar TODAS as opções para o modal de edição ---
    const fetchAllOptions = async () => {
        if (!unidadeId) return;
        console.log("[HISTORICO useEffect] Buscando todas as opções para o modal...");
        try {
            // Buscamos Receita (para Cats Receita + Colaboradores)
            // Buscamos Despesa (para Cats Despesa + Formas Pagamento)
            const [resReceita, resDespesa] = await Promise.all([
                fetch(`/api/getFormOptions?unidadeId=${unidadeId}&tipo=Receita`),
                fetch(`/api/getFormOptions?unidadeId=${unidadeId}&tipo=Despesa`)
            ]);
            if (!resReceita.ok || !resDespesa.ok) {
                console.error("Falha ao buscar listas de opções para edição.");
                return;
            }
            const dataReceita = await resReceita.json();
            const dataDespesa = await resDespesa.json();

            // 1. Salva Categorias (ambos os tipos)
            const categoriasReceita = (dataReceita.categorias || []).map(cat => ({ ...cat, tipo: 'Receita' }));
            const categoriasDespesa = (dataDespesa.categorias || []).map(cat => ({ ...cat, tipo: 'Despesa' }));
            setAllCategorias([...categoriasReceita, ...categoriasDespesa]);

            // 2. Salva Colaboradores (da busca de Receita)
            setAllColaboradores(dataReceita.colaboradores || []);
            
            // 3. Salva Formas de Pagamento (da busca de Despesa - assumindo que são as mesmas)
            // Se precisar de *todas* as FPs (não apenas as de despesa da unidade), teríamos que ajustar a API
            setAllFormasPagamento(dataDespesa.formasPagamento || []);
            
            console.log("[HISTORICO useEffect] Opções para edição carregadas.");
        } catch (catError) {
            console.error("Erro ao buscar opções para edição:", catError);
        }
    };
    fetchAllOptions();
    // --- FIM BUSCA OPÇÕES ---

  }, [user, unidadeId]);
  // --- FIM useEffect ---

  // --- Handlers (Filtrar, Delete) ---
  const handleFiltrarClick = () => { /* ... (código mantido) ... */ };
  const handleDeleteClick = async (idParaApagar) => { /* ... (código mantido) ... */ };

  // --- Handlers para Edição ---
  // 1. Quando o utilizador clica no botão Editar (✎) na linha
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
    setEditFormData(itemFormatado); // Preenche o estado do formulário com os dados da linha
    setEditingItem(itemFormatado);  // Abre o modal (passando o item original para saber o tipo)
    setEditFormError(null);
  };

  // 2. Quando o utilizador altera um campo no modal de edição
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Quando o utilizador clica em "Salvar Alterações" no modal
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setEditFormError(null);
    
    // --- CORREÇÃO: Enviar datas como ISOString UTC ---
    const dataCompetenciaUTC = editFormData.data_competencia ? new Date(editFormData.data_competencia + 'T00:00:00.000Z').toISOString() : null;
    const dataPagamentoFinal = editFormData.data_pagamento || editFormData.data_competencia;
    const dataPagamentoUTC = dataPagamentoFinal ? new Date(dataPagamentoFinal + 'T00:00:00.000Z').toISOString() : null;

    const updatePayload = {
      id_de_lancamento: editingItem.id_de_lancamento,
      dataCompetencia: dataCompetenciaUTC, // Envia ISOString UTC
      dataPagamento: dataPagamentoUTC,     // Envia ISOString UTC
      categoria: editFormData.categoria,
      descricao: editFormData.descricao,
      valor_r: editFormData.valor_r,
      // Envia os IDs corretos (ou null) com base no tipo
      profissional: editingItem.tipo_de_operacao === 'Receita' ? editFormData.profissional : null,
      formaPagamento: editFormData.forma_de_pagamento, // Envia o ID da FP
    };
    console.log("Enviando payload de update:", updatePayload);

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
  };
  // --- FIM Handlers Edição ---

  // --- Cálculos de Totais (mantidos) ---
  const totalReceitas = (lancamentos || []).filter(/*...*/).reduce(/*...*/);
  const totalDespesas = (lancamentos || []).filter(/*...*/).reduce(/*...*/);

  // --- Função para Renderizar Linha (COM BOTÃO EDITAR) ---
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

  // --- Lógica de Renderização Principal (mantida) ---
  const renderHistorico = () => {
    // ... (código mantido, incluindo tabelas com <thead> de "Ações") ...
    if (!unidadeId) { /*...*/ } if (error && !isLoading) { /*...*/ }
    if (lancamentos.length === 0 && !isLoading && !error) { /*...*/ }
    if (isLoading && (!lancamentos || lancamentos.length === 0)) { return null; }

    const receitasDoPeriodo = (lancamentos || []).filter(item => item.tipo_de_operacao === 'Receita');
    const despesasDoPeriodo = (lancamentos || []).filter(item => item.tipo_de_operacao === 'Despesa');

    return (
      <>
        {/* Secção Receitas */}
        <div className="resumo-seccao" /*...*/ >
          <h3>{mostrarReceitas ? '▼' : '►'} Total Receitas (...):</h3>
          <span className="valor-receita">{formatarValor(totalReceitas)}</span>
        </div>
        {mostrarReceitas && ( receitasDoPeriodo.length > 0 ? ( <div className="detalhe-tabela-wrapper"> <table className="tabela-lancamentos detalhe"><thead><tr><th>Data Pag.</th><th>Descrição</th><th style={{ textAlign: 'right' }}>Valor</th><th className="coluna-acoes-header">Ações</th></tr></thead><tbody>{receitasDoPeriodo.map(renderLinha)}</tbody></table></div> ) : ( <p className="historico-mensagem detalhe">Nenhuma receita encontrada no período.</p> ) )}

        {/* Secção Despesas */}
        <div className="resumo-seccao" /*...*/ >
          <h3>{mostrarDespesas ? '▼' : '►'} Total Despesas (...):</h3>
          <span className="valor-despesa">{formatarValor(totalDespesas)}</span>
        </div>
        {mostrarDespesas && ( despesasDoPeriodo.length > 0 ? ( <div className="detalhe-tabela-wrapper"> <table className="tabela-lancamentos detalhe"><thead><tr><th>Data Pag.</th><th>Descrição</th><th style={{ textAlign: 'right' }}>Valor</th><th className="coluna-acoes-header">Ações</th></tr></thead><tbody>{despesasDoPeriodo.map(renderLinha)}</tbody></table></div> ) : ( <p className="historico-mensagem detalhe">Nenhuma despesa encontrada no período.</p> ) )}
      </>
    );
  }; // --- FIM renderHistorico ---

  // --- Return Principal (COM O MODAL DE EDIÇÃO) ---
  return (
    <div className="historico-wrapper">
      {/* Filtro */}
      <div className="filtro-historico"> {/* ... (inputs e botão mantidos) ... */ } </div>

      {/* Resumo */}
      <h2>Resumo do Período Selecionado</h2>
      {isLoading && <p className="historico-mensagem">A carregar...</p>}
      {!isLoading && renderHistorico()}

      {/* --- MODAL DE EDIÇÃO CONDICIONAL --- */}
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
              
              {/* --- Campo Condicional: Profissional (SÓ PARA RECEITAS) --- */}
              {editingItem.tipo_de_operacao === 'Receita' && (
                <div className="form-group">
                  <label htmlFor="edit-profissional">Profissional</label>
                  <select
                    id="edit-profissional"
                    name="profissional" // Nome da coluna no Neon
                    value={editFormData.profissional || ''}
                    onChange={handleEditFormChange}
                    required
                  >
                    <option value="">Selecione...</option>
                    {(allColaboradores || []).map(colab => (
                      <option key={colab.id} value={colab.id}>{colab.nome}</option>
                    ))}
                  </select>
                </div>
              )}
              {/* --- Fim Campo Condicional --- */}

              <div className="form-row">
                {/* Campo Categoria (Filtrado) */}
                <div className="form-group">
                  <label htmlFor="edit-categoria">Categoria</label>
                  <select id="edit-categoria" name="categoria" value={editFormData.categoria || ''} onChange={handleEditFormChange} required>
                    <option value="">Selecione...</option>
                    {(allCategorias || [])
                      .filter(cat => cat.tipo === editingItem.tipo_de_operacao) // Filtra (Receita/Despesa)
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                    ))}
                  </select>
                </div>
                {/* Campo Forma de Pagamento */}
                <div className="form-group">
                    <label htmlFor="edit-formaPagamento">Forma de Pagamento</label>
                    <select
                        id="edit-formaPagamento"
                        name="forma_de_pagamento" // Nome da coluna no Neon
                        value={editFormData.forma_de_pagamento || ''}
                        onChange={handleEditFormChange}
                        required
                    >
                        <option value="">Selecione...</option>
                        {(allFormasPagamento || []).map(fp => (
                            <option key={fp.id} value={fp.id}>{fp.nome}</option>
                        ))}
                    </select>
                </div>
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