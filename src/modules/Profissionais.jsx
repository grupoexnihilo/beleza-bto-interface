import React, { useState } from 'react';
import './Profissionais.css';
import FormProfissional from '../components/FormProfissional';

const Profissionais = ({ onBack }) => {
  const [exibirForm, setExibirForm] = useState(false);
  const [profissionalParaEditar, setProfissionalParaEditar] = useState(null);
  const [modoVisualizacao, setModoVisualizacao] = useState(false);
  
  const [equipe, setEquipe] = useState([
    { 
      id: 1, 
      dataCadastro: '2023-10-01',
      nome: 'Marcos Silva', 
      telefone: '(11) 98888-7777', 
      email: 'marcos@beleza.com',
      servicos: ['Corte Masculino', 'Barba'],
      status: 'Ativo',
      contrato: 'PJ',
      inicioContrato: '2023-10-10'
    }
  ]);

  const abrirForm = (dados = null, apenasVer = false) => {
    setProfissionalParaEditar(dados);
    setModoVisualizacao(apenasVer);
    setExibirForm(true);
  };

  const fecharForm = () => {
    setExibirForm(false);
    setProfissionalParaEditar(null);
    setModoVisualizacao(false);
  };

  const excluirProfissional = (id) => {
    if(window.confirm("Deseja realmente remover este profissional?")) {
      setEquipe(equipe.filter(p => p.id !== id));
    }
  };

  return (
    <div className="modulo-container">
      <header className="modulo-header">
        <div className="header-left-group">
          <button className="btn-voltar-premium" onClick={onBack}>← Voltar</button>
          <div>
            <h2 className="modulo-title">Gestão de Profissionais</h2>
            <p className="modulo-subtitle">Controle sua equipe, contratos e comissões.</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => abrirForm()}>+ Novo Profissional</button>
      </header>

      <div className="modulo-card">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Início Contrato</th>
              <th>Nome Completo</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Serviços</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {equipe.map(p => (
              <tr key={p.id}>
                <td>{new Date(p.inicioContrato).toLocaleDateString('pt-BR')}</td>
                <td 
                  style={{ fontWeight: '700', color: '#0ea5e9', cursor: 'pointer' }}
                  onClick={() => abrirForm(p, true)}
                >
                  {p.nome}
                </td>
                <td>{p.telefone}</td>
                <td>{p.email}</td>
                <td>
                  <div className="lista-tags-servicos">
                    {p.servicos.map((s, idx) => <span key={idx} className="mini-tag">{s}</span>)}
                  </div>
                </td>
                <td>
                  <span className={`status-badge-pill ${p.status.toLowerCase()}`}>
                    {p.status}
                  </span>
                </td>
                <td className="acoes-celula">
                  <button className="btn-icon-edit" onClick={() => abrirForm(p)}>✏️</button>
                  <button className="btn-icon-delete" onClick={() => excluirProfissional(p.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {exibirForm && (
        <FormProfissional 
          onClose={fecharForm}
          profissionalExistente={profissionalParaEditar}
          somenteLeitura={modoVisualizacao}
          onSave={(dados) => {
            if (profissionalParaEditar) {
              setEquipe(equipe.map(item => item.id === profissionalParaEditar.id ? { ...dados, id: item.id } : item));
            } else {
              setEquipe([...equipe, { ...dados, id: Date.now(), dataCadastro: new Date().toISOString() }]);
            }
            fecharForm();
          }}
        />
      )}
    </div>
  );
};

export default Profissionais;