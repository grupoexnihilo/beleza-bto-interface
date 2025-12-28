import React, { useState, useEffect } from 'react';
import './BaseClientes.css';

function BaseClientes({ unidadeId, onBack }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [showSearch, setShowSearch] = useState(false); // Controla a visibilidade da busca
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  // ... (manter funções carregarClientes, handleDelete e handleSalvarEdicao)

  // Filtro Expandido: Nome, Telefone, Email ou CPF
  const filtrados = clientes.filter(c => 
    c.nome?.toLowerCase().includes(busca.toLowerCase()) || 
    c.whatsapp?.includes(busca) ||
    c.email?.toLowerCase().includes(busca.toLowerCase()) ||
    c.cpf?.includes(busca)
  );

  return (
    <div className="base-clientes-container">
      <div className="header-base">
        <button onClick={onBack} className="back-button">← Voltar</button>
        
        <div className="header-actions">
          {/* Campo de busca que expande */}
          <div className={`search-wrapper ${showSearch ? 'active' : ''}`}>
            <input 
              type="text"
              placeholder="Nome, Tel, Email ou CPF..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="search-input-hidden"
              autoFocus={showSearch}
            />
            <button className="btn-lupa" onClick={() => setShowSearch(!showSearch)}>
              🔍
            </button>
          </div>
          <h2>Base de Clientes ({filtrados.length})</h2>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="clientes-table">
          <thead>
            <tr>
              <th style={{width: '100px'}}>Data</th>
              <th className="col-nome">Nome do Cliente</th>
              <th style={{width: '150px'}}>Telefone</th>
              <th>Última Observação</th>
              <th style={{width: '100px', textAlign: 'center'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {/* ... (mesmo mapeamento da resposta anterior) */}
          </tbody>
        </table>
      </div>
      
      {/* ... (Modal de Edição) */}
    </div>
  );
}

export default BaseClientes;