import React, { useState } from 'react';
import './CadastroClienteForm.css';

function CadastroClienteForm({ user, unidadeId, unidades, onBack }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    data_nascimento: '',
    observacoes: ''
  });

  const unidadeAtual = unidades.find(u => u.id === unidadeId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      id: `cli_${crypto.randomUUID().substring(0, 8)}`,
      unidade: unidadeId,
      cadastrado_por: user?.email
    };

    try {
      const response = await fetch('/api/cadastrar-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Cliente cadastrado com sucesso!');
        onBack();
      } else {
        const data = await response.json();
        alert('Erro ao salvar: ' + (data.message || data.error));
      }
    } catch (err) {
      alert('Falha na comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <button onClick={onBack} className="back-button">← Voltar ao Painel</button>
      <h3>Novo Cadastro de Cliente</h3>
      
      <form onSubmit={handleSubmit} className="entrada-form">
        <div className="form-row">
          <div className="form-group">
            <label>Unidade de Trabalho</label>
            <input type="text" value={unidadeAtual?.nome || ''} disabled />
          </div>
          {/* CAMPO DATA DE NASCIMENTO RESTAURADO ABAIXO */}
          <div className="form-group">
            <label>Data de Nascimento</label>
            <input 
              type="date" 
              value={formData.data_nascimento}
              onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Nome do Cliente</label>
            <input 
              type="text" required placeholder="Nome completo"
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
          <label>Observações / Saúde</label>
          <textarea 
            rows="3" placeholder="Alergias ou restrições..."
            value={formData.observacoes}
            onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
          />
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'A Salvar...' : 'Salvar Cliente'}
        </button>
      </form>
    </div>
  );
}

export default CadastroClienteForm;