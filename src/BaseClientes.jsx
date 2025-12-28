import React, { useState, useEffect, useCallback } from 'react';
import './BaseClientes.css';

function BaseClientes({ unidadeId, onBack }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const carregarClientes = useCallback(async () => {
    if (!unidadeId) return;
    setLoading(true);
    try {
      // Seguindo o padrão de URL das suas APIs funcionais
      const response = await fetch(`/api/get-clientes?unidadeId=${unidadeId}`);
      if (!response.ok) throw new Error('Falha na resposta da API');
      const data = await response.json();
      
      // Se data for um array (padrão das suas APIs), salva no estado
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

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Deseja realmente excluir este cliente?")) {
      try {
        const res = await fetch(`/api/deletar-cliente?id=${id}`, { method: 'DELETE' });
        if (res.ok) carregarClientes();
      } catch (err) { alert("Erro ao deletar"); }
    }
  };

  const filtrados = clientes.filter(c => 
    c.nome?.toLowerCase().includes(busca.toLowerCase()) || 
    c.whatsapp?.includes(busca) ||
    c.cpf?.includes(busca)
  );

  return (
    <div className="base-clientes-container">
      <div className="header-base">
        <button onClick={onBack} className="back-button">← Voltar</button>
        <div className="header-actions">
           <div className={`search-wrapper ${showSearch ? 'active' : ''}`}>
            <input 
              type="text" 
              placeholder="Nome, Tel ou CPF..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="search-input-hidden"
            />
            <button className="btn-lupa" onClick={() => setShowSearch(!showSearch)}>🔍</button>
          </div>
          <h2>Base de Clientes ({filtrados.length})</h2>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="clientes-table">
          <thead>
            <tr>
              <th style={{width: '120px'}}>Cadastro</th>
              <th className="col-nome">Nome do Cliente</th>
              <th style={{width: '160px'}}>WhatsApp</th>
              <th>Última Observação</th>
              <th style={{width: '100px', textAlign: 'center'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '40px'}}>Buscando dados no servidor...</td></tr>
            ) : filtrados.length > 0 ? (
              filtrados.map(c => (
                <tr key={c.id} onClick={() => setClienteSelecionado(c)} className="row-clicavel">
                  <td style={{color: '#888'}}>{c.data_cadastro ? new Date(c.data_cadastro).toLocaleDateString('pt-BR') : '-'}</td>
                  <td className="col-nome">{c.nome}</td>
                  <td>{c.whatsapp}</td>
                  <td className="obs-preview">{c.atividade || <em style={{color: '#444'}}>Sem notas</em>}</td>
                  <td className="actions-cell">
                    <button className="btn-icon" onClick={(e) => {e.stopPropagation(); setClienteSelecionado(c)}}>✏️</button>
                    <button className="btn-icon" onClick={(e) => handleDelete(e, c.id)}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '40px'}}>Nenhum cliente encontrado para esta unidade.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO PERMANECE O MESMO */}
    </div>
  );
}

export default BaseClientes;