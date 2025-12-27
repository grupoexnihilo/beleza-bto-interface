import React, { useState, useEffect } from 'react';
import './BaseClientes.css';

function BaseClientes({ unidadeId, onBack }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const fetchClientes = async () => {
      if (!unidadeId) return;
      try {
        const response = await fetch(`/api/get-clientes?unidadeId=${unidadeId}`);
        if (!response.ok) throw new Error('Erro ao buscar clientes');
        const data = await response.json();
        setClientes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, [unidadeId]);

  const clientesFiltrados = clientes.filter(c => 
    c.nome?.toLowerCase().includes(busca.toLowerCase()) || 
    c.whatsapp?.includes(busca)
  );

  return (
    <div className="form-container">
      <button onClick={onBack} className="back-button">← Voltar ao Painel</button>
      <h3>Base de Clientes</h3>

      <div className="search-container" style={{marginBottom: '20px'}}>
        <input 
          type="text" 
          placeholder="Buscar por nome ou WhatsApp..." 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container" style={{overflowX: 'auto'}}>
        <table className="historico-table"> {/* Usando sua classe global de tabelas */}
          <thead>
            <tr>
              <th>Nome</th>
              <th>WhatsApp</th>
              <th>Nascimento</th>
              <th>Obs. Saúde</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4">Carregando...</td></tr>
            ) : clientesFiltrados.length > 0 ? (
              clientesFiltrados.map(cliente => (
                <tr key={cliente.id}>
                  <td>{cliente.nome}</td>
                  <td>{cliente.whatsapp}</td>
                  <td>{cliente.data_nascimento ? new Date(cliente.data_nascimento).toLocaleDateString() : '-'}</td>
                  <td>{cliente.observacoes}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4">Nenhum cliente cadastrado nesta unidade.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BaseClientes;