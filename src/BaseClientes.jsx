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
        const data = await response.json();
        setClientes(data);
      } catch (err) {
        console.error("Erro ao buscar clientes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, [unidadeId]);

  const handleEdit = (e, cliente) => {
    e.stopPropagation(); // Impede que o clique na linha seja acionado
    alert(`Editar: ${cliente.nome}`);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation(); // Impede que o clique na linha seja acionado
    if(window.confirm("Tem certeza que deseja excluir este cliente?")) {
      alert(`Excluir ID: ${id}`);
      // Lógica de delete virá na sequência
    }
  };

  const handleVerDetalhes = (cliente) => {
    alert(`Ficha Completa:\nNome: ${cliente.nome}\nCPF: ${cliente.cpf}\nEmail: ${cliente.email}\nEndereço: ${cliente.endereco}, ${cliente.numero}\nBairro: ${cliente.bairro}\nCidade: ${cliente.cidade}`);
  };

  const filtrados = clientes.filter(c => 
    c.nome?.toLowerCase().includes(busca.toLowerCase()) || 
    c.whatsapp?.includes(busca)
  );

  return (
    <div className="base-clientes-container">
      <button onClick={onBack} className="back-button">← Voltar</button>
      <h2>Base de Clientes</h2>

      <div className="search-bar">
        <input 
          className="search-input"
          placeholder="Filtrar por nome ou celular..." 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Última Obs.</th>
              <th style={{textAlign: 'center'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5">Buscando dados...</td></tr>
            ) : filtrados.map(c => (
              <tr key={c.id} onClick={() => handleVerDetalhes(c)} className="row-clicavel">
                <td className="text-small">{c.data_cadastro ? new Date(c.data_cadastro).toLocaleDateString('pt-BR') : '-'}</td>
                <td className="text-bold">{c.nome}</td>
                <td>{c.whatsapp}</td>
                <td className="obs-preview">{c.atividade || 'Sem observações'}</td>
                <td className="actions-cell">
                  <button className="btn-icon edit" onClick={(e) => handleEdit(e, c)} title="Editar">✏️</button>
                  <button className="btn-icon delete" onClick={(e) => handleDelete(e, c.id)} title="Excluir">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BaseClientes;