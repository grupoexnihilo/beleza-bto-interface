import React, { useState } from 'react';
import './CadastroClienteForm.css';

function CadastroClienteForm({ user, unidadeId, unidades, onBack }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '', whatsapp: '', data_nascimento: '', cpf: '',
    email: '', endereco: '', numero: '', complemento: '', atividade: ''
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
        alert('Erro: ' + data.message);
      }
    } catch (err) {
      alert('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <button onClick={onBack} className="back-button">← Voltar</button>
      <h3>Ficha Cadastral do Cliente</h3>
      
      <form onSubmit={handleSubmit} className="entrada-form">
        {/* Unidade e CPF */}
        <div className="form-row">
          <div className="form-group">
            <label>Unidade</label>
            <input type="text" value={unidadeAtual?.nome || ''} disabled />
          </div>
          <div className="form-group">
            <label>CPF</label>
            <input 
              type="text" placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={(e) => setFormData({...formData, cpf: e.target.value})}
            />
          </div>
        </div>

        {/* Nome e WhatsApp */}
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
            <label>WhatsApp / Telefone</label>
            <input 
              type="text" placeholder="(00) 00000-0000"
              value={formData.whatsapp}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
            />
          </div>
        </div>

        {/* Email e Data Nascimento */}
        <div className="form-row">
          <div className="form-group">
            <label>E-mail</label>
            <input 
              type="email" placeholder="cliente@email.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Data de Nascimento</label>
            <input 
              type="date" 
              value={formData.data_nascimento}
              onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
            />
          </div>
        </div>

        {/* Endereço */}
        <div className="form-row" style={{ gridTemplateColumns: '3fr 1fr 2fr' }}>
          <div className="form-group">
            <label>Endereço</label>
            <input 
              type="text" placeholder="Rua, Avenida..."
              value={formData.endereco}
              onChange={(e) => setFormData({...formData, endereco: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Nº</label>
            <input 
              type="text"
              value={formData.numero}
              onChange={(e) => setFormData({...formData, numero: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Complemento</label>
            <input 
              type="text" placeholder="Apto, Bloco..."
              value={formData.complemento}
              onChange={(e) => setFormData({...formData, complemento: e.target.value})}
            />
          </div>
        </div>

        {/* Atividade / Histórico */}
        <div className="form-group">
          <label>Atividade (Observações e Histórico)</label>
          <textarea 
            rows="5" 
            placeholder="Registre aqui o histórico, preferências ou restrições do cliente..."
            value={formData.atividade}
            onChange={(e) => setFormData({...formData, atividade: e.target.value})}
          />
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Salvando Ficha...' : 'Finalizar Cadastro'}
        </button>
      </form>
    </div>
  );
}

export default CadastroClienteForm;