import React, { useState } from 'react';

const FormServico = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    valor: '',
    profissional: '',
    tipo: 'Individual',
    tempo: '01:00',
    status: 'Ativo'
  });

  // Máscara de Moeda (Igual ao Caixa)
  const handleMoneyChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = (value / 100).toFixed(2) + "";
    value = value.replace(".", ",");
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    setFormData({ ...formData, valor: "R$ " + value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Limpa a máscara para salvar apenas o número
    const valorNumerico = parseFloat(formData.valor.replace("R$ ", "").replace(".", "").replace(",", "."));
    onSave({ ...formData, valor: valorNumerico });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content fade-in">
        <div className="modal-header">
          <h3>Novo Serviço</h3>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group full-width">
            <label>Nome do Serviço</label>
            <input 
              type="text" 
              placeholder="Ex: Corte de Cabelo" 
              required 
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Valor</label>
            <input 
              type="text" 
              placeholder="R$ 0,00" 
              onChange={handleMoneyChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Profissional</label>
            <select onChange={(e) => setFormData({...formData, profissional: e.target.value})} required>
              <option value="">Selecione...</option>
              <option value="Carlos Silva">Carlos Silva</option>
              <option value="Ana Paula">Ana Paula</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tipo</label>
            <select onChange={(e) => setFormData({...formData, tipo: e.target.value})}>
              <option value="Individual">Individual</option>
              <option value="Em Grupo">Em Grupo</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tempo Estimado</label>
            <input 
              type="time" 
              value={formData.tempo}
              onChange={(e) => setFormData({...formData, tempo: e.target.value})}
              required 
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select onChange={(e) => setFormData({...formData, status: e.target.value})}>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>

          <div className="modal-actions full-width">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Salvar Serviço</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormServico;