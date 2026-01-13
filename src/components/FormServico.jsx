import React, { useState, useEffect } from 'react';
import './FormServico.css';

const FormServico = ({ onClose, onSave, servicoExistente }) => {
  const [formData, setFormData] = useState({
    nome: '',
    valor: '',
    profissional: '',
    tipo: 'Individual',
    tempo: '01:00',
    status: 'Ativo',
    categoria: 'Serviço'
  });

  // Efeito para carregar dados se for edição
  useEffect(() => {
    if (servicoExistente) {
      setFormData({
        ...servicoExistente,
        valor: typeof servicoExistente.valor === 'number' 
               ? "R$ " + servicoExistente.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) 
               : servicoExistente.valor
      });
    }
  }, [servicoExistente]);

  const handleMoneyChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = (value / 100).toFixed(2) + "";
    value = value.replace(".", ",");
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    setFormData({ ...formData, valor: "R$ " + value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const valorNumerico = parseFloat(
      formData.valor.replace("R$ ", "").replace(/\./g, "").replace(",", ".")
    );
    onSave({ ...formData, valor: valorNumerico });
  };

  return (
    <div className="form-full-screen-overlay fade-in">
      <div className="form-full-screen-container">
        
        <header className="form-full-header">
          <div className="header-info">
            <span className="badge-categoria">{formData.categoria}</span>
            <h2>{servicoExistente ? 'Editar Registro' : 'Novo Serviço ou Produto'}</h2>
            <p>Preencha os dados abaixo para manter seu catálogo atualizado.</p>
          </div>
          <button className="btn-close-full" onClick={onClose}>&times;</button>
        </header>

        <form onSubmit={handleSubmit} className="form-full-body">
          <div className="form-section">
            <h4 className="section-title">Informações Básicas</h4>
            <div className="full-grid">
              
              <div className="input-group span-2">
                <label>Nome do Item</label>
                <input 
                  type="text" 
                  value={formData.nome}
                  placeholder="Ex: Corte Degradê ou Shampoo Pós-Química"
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required 
                />
              </div>

              <div className="input-group">
                <label>Categoria</label>
                <select 
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                >
                  <option value="Serviço">Serviço</option>
                  <option value="Produto">Produto</option>
                </select>
              </div>

              <div className="input-group">
                <label>Valor de Venda</label>
                <input 
                  type="text" 
                  value={formData.valor}
                  placeholder="R$ 0,00"
                  onChange={handleMoneyChange}
                  required 
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4 className="section-title">Configurações de Execução</h4>
            <div className="full-grid">
              
              <div className="input-group">
                <label>Profissional Responsável</label>
                <select 
                  value={formData.profissional}
                  onChange={(e) => setFormData({...formData, profissional: e.target.value})}
                  required
                >
                  <option value="">Selecione um profissional...</option>
                  <option value="Carlos Silva">Carlos Silva</option>
                  <option value="Ana Paula">Ana Paula</option>
                  <option value="Marcos Souza">Marcos Souza</option>
                </select>
              </div>

              <div className="input-group">
                <label>Tipo de Atendimento</label>
                <select 
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                >
                  <option value="Individual">Individual</option>
                  <option value="Em Grupo">Em Grupo</option>
                </select>
              </div>

              <div className="input-group">
                <label>Tempo Estimado</label>
                <input 
                  type="time" 
                  value={formData.tempo}
                  onChange={(e) => setFormData({...formData, tempo: e.target.value})}
                  required 
                />
              </div>

              <div className="input-group">
                <label>Status no Sistema</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

            </div>
          </div>

          <footer className="form-full-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save-full">
              {servicoExistente ? 'Salvar Alterações' : 'Confirmar Cadastro'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default FormServico;