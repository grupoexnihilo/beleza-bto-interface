import React, { useState } from 'react';
import './CadastroClienteForm.css';

const CadastroClienteForm = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '', whatsapp: '', data_nascimento: '', observacoes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const clienteData = {
      ...formData,
      id: `cli_${crypto.randomUUID().substring(0, 8)}`
    };

    try {
      const response = await fetch('/api/cadastrar-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteData),
      });

      if (response.ok) {
        alert('Cliente cadastrado com sucesso!');
        onBack();
      } else {
        alert('Erro ao salvar no banco.');
      }
    } catch (error) {
      alert('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <button onClick={onBack} className="back-button"> ← Voltar</button>
      <h3>Novo Cadastro de Cliente</h3>
      
      <form onSubmit={handleSubmit} className="entrada-form">
        <div className="form-row">
          <div className="form-group">
            <label>Nome Completo</label>
            <input 
              type="text" 
              placeholder="Digite o nome..." 
              required
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>WhatsApp</label>
            <input 
              type="text" 
              placeholder="(00) 00000-0000"
              value={formData.whatsapp}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Data de Nascimento</label>
            <input 
              type="date"
              value={formData.data_nascimento}
              onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Observações / Histórico de Saúde</label>
          <textarea 
            placeholder="Alergias, restrições ou preferências..."
            rows="4"
            style={{ 
              backgroundColor: 'var(--input-bg)', 
              color: 'var(--text-color-primary)', 
              border: '1px solid var(--input-border)',
              borderRadius: '6px',
              padding: '12px'
            }}
            value={formData.observacoes}
            onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
          />
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
        </button>
      </form>
    </div>
  );
};

export default CadastroClienteForm;