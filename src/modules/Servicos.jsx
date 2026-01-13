import React, { useState } from 'react';
import FormServico from '../components/FormServico';
import './Servicos.css';

const Servicos = () => {
  const [exibirForm, setExibirForm] = useState(false);
  const [servicos, setServicos] = useState([
    // Dados fictícios para teste
    { id: 1, nome: 'Corte Masculino', valor: 50.00, profissional: 'Carlos Silva', tipo: 'Individual', tempo: '00:30', status: 'Ativo' },
    { id: 2, nome: 'Coloração', valor: 180.00, profissional: 'Ana Paula', tipo: 'Individual', tempo: '02:00', status: 'Ativo' },
  ]);

  return (
    <div className="modulo-container fade-in">
      <div className="modulo-header">
        <div>
          <h2 className="modulo-title">Gestão de Serviços</h2>
          <p className="modulo-subtitle">Cadastre e gerencie os procedimentos oferecidos</p>
        </div>
        <button className="btn-primary" onClick={() => setExibirForm(true)}>
          + Adicionar Serviço
        </button>
      </div>

      <div className="modulo-card">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Serviço</th>
              <th>Categoria</th>
              <th>Profissional</th>
              <th>Tipo</th>
              <th>Tempo</th>
              <th>Valor</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicos.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: '600', color: '#fff' }}>{s.nome}</td>
                <td style={{ fontSize: '0.8rem', color: '#888' }}>
                <span className={`categoria-tag ${s.categoria === 'Produto' ? 'gold' : 'blue'}`}>
                {s.categoria}
                </span>
                </td>
                <td>{s.profissional}</td>
                <td>{s.tipo}</td>
                <td>{s.tempo}h</td>
                <td style={{ color: '#10b981', fontWeight: 'bold' }}>
                  R$ {s.valor.toFixed(2)}
                </td>
                <td>
                  <span className={`status-badge ${s.status.toLowerCase()}`}>
                    {s.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-icon-edit">✏️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {exibirForm && (
        <FormServico 
          onClose={() => setExibirForm(false)} 
          onSave={(novo) => {
            setServicos([...servicos, { ...novo, id: Date.now() }]);
            setExibirForm(false);
          }}
        />
      )}
    </div>
  );
};

export default Servicos;