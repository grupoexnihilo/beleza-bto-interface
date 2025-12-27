import React, { useState } from 'react';
import './CadastroClienteForm.css';

function CadastroClienteForm({ user, unidadeId, unidades, onBack }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '', whatsapp: '', data_nascimento: '', observacoes: ''
  });

  // Encontra o nome da unidade atual baseado no ID que veio do App.jsx
  const unidadeAtual = unidades.find(u => u.id === unidadeId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email) {
      alert("Erro: Usuário não identificado. Tente fazer login novamente.");
      return;
    }

    setLoading(true);
    const payload = {
      ...formData,
      id: `cli_${crypto.randomUUID().substring(0, 8)}`,
      unidade: unidadeId,
      cadastrado_por: user.email
    };

    try {
      const response = await fetch('/api/cadastrar-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Cliente cadastrado com sucesso!');
        onBack();
      } else {
        alert('Erro no banco: ' + result.error);
      }
    } catch (error) {
      alert('Erro de conexão com a API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <button onClick={onBack} className="back-button"> ← Voltar ao Painel</button>
      <h3>Novo Cadastro de Cliente</h3>
      
      <form onSubmit={handleSubmit} className="entrada-form">
        <div className="form-row">
          <div className="form-group">
            <label>Unidade de Atendimento</label>
            {/* Dropdown desabilitado apenas para exibição do nome da unidade logada */}
            <select disabled value={unidadeId}>
               <option value={unidadeId}>{unidadeAtual?.nome || 'Carregando unidade...'}</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Nome Completo</label>
            <input 
              type="text" required
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>WhatsApp</label>
            <input 
              type="text" placeholder="(00) 00000-0000"
              value={formData.whatsapp}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Observações de Saúde</label>
          <textarea 
            rows="3"
            value={formData.observacoes}
            onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
          />
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Salvando...' : 'Finalizar Cadastro'}
        </button>
      </form>
    </div>
  );
}

export default CadastroClienteForm;