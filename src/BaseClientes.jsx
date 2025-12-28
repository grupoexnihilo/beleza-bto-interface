import React, { useState, useEffect, useCallback } from 'react';
import './BaseClientes.css';

function BaseClientes({ unidadeId, onBack }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [editando, setEditando] = useState(false);

  const carregarClientes = useCallback(async () => {
    if (!unidadeId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/get-clientes?unidadeId=${unidadeId}`);
      const data = await response.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [unidadeId]);

  useEffect(() => { carregarClientes(); }, [carregarClientes]);

  const handleSalvarEdicao = async () => {
    try {
      const response = await fetch('/api/editar-cliente', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteSelecionado),
      });

      if (response.ok) {
        alert('Dados atualizados com sucesso!');
        setEditando(false);
        setClienteSelecionado(null);
        carregarClientes();
      } else {
        alert('Erro ao salvar no banco.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Excluir cliente definitivamente?")) {
      await fetch(`/api/deletar-cliente?id=${id}`, { method: 'DELETE' });
      carregarClientes();
    }
  };

  const filtrados = clientes.filter(c => 
    c.nome?.toLowerCase().includes(busca.toLowerCase()) || c.whatsapp?.includes(busca)
  );

  return (
    <div className="base-clientes-container">
      <div className="header-base">
        <button onClick={onBack} className="back-button">← Voltar</button>
        <h2>Base de Clientes ({filtrados.length})</h2>
      </div>

      <input 
        className="search-input-fix" 
        placeholder="🔍 Pesquisar cliente..." 
        value={busca} 
        onChange={(e) => setBusca(e.target.value)} 
      />

      <div className="table-wrapper">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>WhatsApp</th>
              <th>Última Obs.</th>
              <th style={{textAlign: 'center'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4">Carregando...</td></tr>
            ) : filtrados.map(c => (
              <tr key={c.id} onClick={() => { setClienteSelecionado(c); setEditando(false); }} className="row-clicavel">
                <td className="col-nome">{c.nome}</td>
                <td>{c.whatsapp}</td>
                <td className="obs-preview">{c.atividade || 'Sem notas'}</td>
                <td className="actions-cell">
                  <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setClienteSelecionado(c); setEditando(true); }}>✏️</button>
                  <button className="btn-icon" onClick={(e) => handleDelete(e, c.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FICHA / PÁGINA DO CLIENTE (MODAL EXPANDIDO) */}
      {clienteSelecionado && (
        <div className="modal-overlay">
          <div className="modal-content FichaCliente">
            <div className="modal-header">
              <h3>{editando ? 'Editando Cadastro' : 'Ficha do Cliente'}</h3>
              <button className="close-modal" onClick={() => setClienteSelecionado(null)}>×</button>
            </div>

            <div className="ficha-body">
              <div className="form-group">
                <label>Nome Completo</label>
                <input 
                  type="text" 
                  disabled={!editando} 
                  value={clienteSelecionado.nome || ''} 
                  onChange={e => setClienteSelecionado({...clienteSelecionado, nome: e.target.value})}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>WhatsApp</label>
                  <input 
                    type="text" 
                    disabled={!editando} 
                    value={clienteSelecionado.whatsapp || ''} 
                    onChange={e => setClienteSelecionado({...clienteSelecionado, whatsapp: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>E-mail</label>
                  <input 
                    type="text" 
                    disabled={!editando} 
                    value={clienteSelecionado.email || ''} 
                    onChange={e => setClienteSelecionado({...clienteSelecionado, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Observações / Histórico</label>
                <textarea 
                  rows="5" 
                  disabled={!editando} 
                  value={clienteSelecionado.atividade || ''} 
                  onChange={e => setClienteSelecionado({...clienteSelecionado, atividade: e.target.value})}
                />
              </div>
              
              {!editando && (
                <div className="dados-extras">
                  <p><strong>CPF:</strong> {clienteSelecionado.cpf || 'Não informado'}</p>
                  <p><strong>Endereço:</strong> {clienteSelecionado.endereco}, {clienteSelecionado.numero} - {clienteSelecionado.bairro}</p>
                  <p><strong>Cidade:</strong> {clienteSelecionado.cidade} / {clienteSelecionado.estado}</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              {editando ? (
                <button className="btn-salvar" onClick={handleSalvarEdicao}>Gravar Alterações</button>
              ) : (
                <button className="btn-salvar" onClick={() => setEditando(true)}>Editar Ficha</button>
              )}
              <button className="btn-cancelar" onClick={() => setClienteSelecionado(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BaseClientes;