import React, { useState, useEffect, useCallback } from 'react';
import './BaseClientes.css';
import CadastroClienteForm from '../components/CadastroClienteForm';

function BaseClientes({ unidadeId, onBack, user, unidades }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [editando, setEditando] = useState(false);
  
  // ESTADO QUE CONTROLA A TROCA DE TELA
  const [modoCadastro, setModoCadastro] = useState(false);

  // --- LÓGICA DE CARREGAMENTO ---
  const carregarClientes = useCallback(async () => {
    if (!unidadeId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/get-clientes?unidadeId=${unidadeIdAtiva}`);
      if (!response.ok) throw new Error('Falha na resposta da API');
      const data = await response.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
    } finally {
      setLoading(false);
    }
  }, [unidadeId]);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);
  

  // --- LÓGICA DE EDIÇÃO (EXISTENTE) ---
  const handleSalvarEdicao = async (e) => {
    if(e) e.preventDefault();
    try {
      const response = await fetch('/api/editar-cliente', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteSelecionado),
      });

      if (response.ok) {
        alert('Ficha atualizada com sucesso!');
        setEditando(false);
        carregarClientes();
      } else {
        alert('Erro ao salvar alterações.');
      }
    } catch (err) {
      alert('Erro de conexão com o servidor.');
    }
  };

  // --- LÓGICA DE EXCLUSÃO ---
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja excluir permanentemente este cliente?")) {
      try {
        const res = await fetch(`/api/deletar-cliente?id=${id}`, { method: 'DELETE' });
        if (res.ok) carregarClientes();
      } catch (err) {
        alert("Erro ao excluir cliente.");
      }
    }
  };

  // --- FILTRO DE BUSCA ---
  const filtrados = clientes.filter(c => 
    c.nome?.toLowerCase().includes(busca.toLowerCase()) || 
    c.whatsapp?.includes(busca) ||
    c.cpf?.includes(busca) ||
    c.email?.toLowerCase().includes(busca.toLowerCase())
  );

  // --- LÓGICA DE NAVEGAÇÃO ENTRE LISTA E FORMULÁRIO ---
  // --- RENDERIZAÇÃO CONDICIONAL ---
  if (modoCadastro) {
    return (
      <div className="container-integracao-cadastro">
        <CadastroClienteForm 
          unidadeId={unidadeIdAtiva} 
          unidades={unidades || []}
          user={user}
          onBack={() => {
            setModoCadastro(false);
            carregarClientes(); 
          }} 
        />
      </div>
    );
  }

  return (
    <div className="base-clientes-container">
      {/* HEADER DA LISTA */}
      <div className="header-base">
        <button onClick={onBack} className="back-button">← Voltar</button>
        <div className="header-actions">
          <div className={`search-wrapper ${showSearch ? 'active' : ''}`}>
            <input 
              type="text" 
              placeholder="Nome, Telefone, CPF ou Email..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="search-input-hidden"
            />
            <button className="btn-lupa" onClick={() => setShowSearch(!showSearch)}>🔍</button>
          </div>

          <button className="btn-novo-cliente" onClick={() => setModoCadastro(true)}>
            <span>+</span> Novo Cliente
          </button>

          <h2 style={{color: 'white'}}>Base de Clientes ({filtrados.length})</h2>
        </div>
      </div>

      {/* TABELA PRINCIPAL */}
      <div className="table-wrapper">
        <table className="clientes-table">
          <thead>
            <tr>
              <th style={{width: '120px'}}>Cadastro</th>
              <th className="col-nome">Nome do Cliente</th>
              <th style={{width: '160px'}}>WhatsApp</th>
              <th>Última Observação</th>
              <th style={{width: '120px', textAlign: 'center'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '50px'}}>Buscando dados no servidor...</td></tr>
            ) : filtrados.map(c => (
              <tr key={c.id} onClick={() => { setClienteSelecionado(c); setEditando(false); }} className="row-clicavel">
                <td style={{color: '#888'}}>{c.data_cadastro ? new Date(c.data_cadastro).toLocaleDateString('pt-BR') : '-'}</td>
                <td className="col-nome">{c.nome}</td>
                <td>{c.whatsapp}</td>
                <td className="obs-preview">{c.atividade || <em style={{color: '#444'}}>Sem notas</em>}</td>
                <td className="actions-cell">
                  <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setClienteSelecionado(c); setEditando(true); }}>✏️</button>
                  <button className="btn-icon" onClick={(e) => handleDelete(e, c.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FICHA DE EDIÇÃO (OVERLAY) */}
      {clienteSelecionado && (
        <div className="full-screen-overlay">
          <div className="ficha-container-premium">
            <div className="ficha-header-sticky">
              <button className="back-button" onClick={() => setClienteSelecionado(null)}>← Voltar para a Lista</button>
              <h3>{editando ? 'Editando Ficha' : 'Ficha Detalhada'}</h3>
              <div className="header-btns">
                {!editando ? (
                  <button className="submit-button" style={{background: '#333'}} onClick={() => setEditando(true)}>Editar Dados</button>
                ) : (
                  <button className="submit-button" onClick={handleSalvarEdicao}>Gravar Alterações</button>
                )}
              </div>
            </div>

            <div className="ficha-content-scroll">
              <form onSubmit={handleSalvarEdicao} className="entrada-form">
                <div className="form-section">
                  <h4>Informações Pessoais</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nome Completo</label>
                      <input type="text" disabled={!editando} value={clienteSelecionado.nome || ''} onChange={e => setClienteSelecionado({...clienteSelecionado, nome: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Data de Nascimento</label>
                      <input type="date" disabled={!editando} value={clienteSelecionado.data_nascimento?.split('T')[0] || ''} onChange={e => setClienteSelecionado({...clienteSelecionado, data_nascimento: e.target.value})} />
                    </div>
                  </div>
                  {/* ... demais campos da sua ficha original ... */}
                </div>
                {/* (Mantenha o restante dos seus campos da ficha aqui) */}
              </form>
            </div>
            <div className="ficha-footer">
              <button className="back-button" onClick={() => setClienteSelecionado(null)}>Fechar Ficha</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BaseClientes;