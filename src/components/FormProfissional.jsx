import React, { useState, useEffect } from 'react';
import './FormProfissional.css';

const FormProfissional = ({ onClose, onSave, profissionalExistente, somenteLeitura }) => {
  const [formData, setFormData] = useState({
    nome: '', contrato: 'PJ', documento: '', telefone: '', email: '',
    cep: '', rua: '', bairro: '', cidade: '', estado: '',
    inicioContrato: '', servicos: [], tipoComissao: 'Percentual por serviço', comissao: '', status: 'Pendente'
  });

  const [novoServico, setNovoServico] = useState('');

  useEffect(() => {
    if (profissionalExistente) setFormData(profissionalExistente);
  }, [profissionalExistente]);

  // --- MÁSCARAS ---
  const maskPhone = (v) => {
    v = v.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1.$2");
    return v.substring(0, 15);
  };

  const maskDoc = (v, type) => {
    v = v.replace(/\D/g, "");
    if (type === 'CLT' || type === 'PF') {
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4").substring(0, 14);
    } else {
      return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5").substring(0, 18);
    }
  };

  const handleCEP = async (cep) => {
    const cleanCEP = cep.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, cep: cleanCEP }));
    if (cleanCEP.length === 8) {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData(prev => ({ ...prev, rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf }));
      }
    }
  };

  const addServico = () => {
    if (novoServico.trim() && !formData.servicos.includes(novoServico)) {
      setFormData({ ...formData, servicos: [...formData.servicos, novoServico.trim()] });
      setNovoServico('');
    }
  };

  return (
    <div className="form-full-screen-overlay fade-in">
      <div className="form-full-screen-container">
        <header className="form-full-header">
          <div className="header-info">
            <span className="badge-categoria">RH & EQUIPE</span>
            <h2>{somenteLeitura ? 'Ficha do Profissional' : (profissionalExistente ? 'Editar Profissional' : 'Novo Profissional')}</h2>
          </div>
          <button className="btn-close-full" onClick={onClose}>&times;</button>
        </header>

        <form className="form-full-body" onSubmit={(e) => { e.preventDefault(); if(!somenteLeitura) onSave(formData); }}>
          <div className="form-section">
            <h4 className="section-title">Dados Contratuais</h4>
            <div className="full-grid">
              <div className="input-group">
                <label>Tipo de Contrato</label>
                <select disabled={somenteLeitura} value={formData.contrato} onChange={e => setFormData({...formData, contrato: e.target.value, documento: ''})}>
                  <option value="CLT">CLT (CPF)</option>
                  <option value="PJ">PJ (CNPJ)</option>
                  <option value="PF">Autônomo (CPF)</option>
                </select>
              </div>
              <div className="input-group">
                <label>{formData.contrato === 'PJ' ? 'CNPJ' : 'CPF'}</label>
                <input disabled={somenteLeitura} type="text" value={formData.documento} onChange={e => setFormData({...formData, documento: maskDoc(e.target.value, formData.contrato)})} />
              </div>
              <div className="input-group">
                <label>Início do Contrato</label>
                <input disabled={somenteLeitura} type="date" value={formData.inicioContrato} onChange={e => setFormData({...formData, inicioContrato: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Status</label>
                <select disabled={somenteLeitura} className={formData.status.toLowerCase()} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Ativo">Ativo</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4 className="section-title">Informações Pessoais</h4>
            <div className="full-grid">
              <div className="input-group span-2">
                <label>Nome Completo</label>
                <input disabled={somenteLeitura} type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Telefone</label>
                <input disabled={somenteLeitura} type="text" value={formData.telefone} onChange={e => setFormData({...formData, telefone: maskPhone(e.target.value)})} />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input disabled={somenteLeitura} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4 className="section-title">Serviços e Financeiro</h4>
            <div className="full-grid">
              <div className="input-group span-2">
                <label>Habilidades / Serviços (Aperte Adicionar)</label>
                <div className="tag-input-container">
                  <input disabled={somenteLeitura} type="text" value={novoServico} onChange={e => setNovoServico(e.target.value)} placeholder="Digite um serviço..." />
                  <button type="button" onClick={addServico} disabled={somenteLeitura}>Adicionar</button>
                </div>
                <div className="tags-display">
                  {formData.servicos.map(s => <span key={s} className="tag-item">{s} <i onClick={() => !somenteLeitura && setFormData({...formData, servicos: formData.servicos.filter(x => x !== s)})}>&times;</i></span>)}
                </div>
              </div>
              <div className="input-group">
                <label>Tipo de Comissionamento</label>
                <select disabled={somenteLeitura} value={formData.tipoComissao} onChange={e => setFormData({...formData, tipoComissao: e.target.value, comissao: ''})}>
                  <option value="Percentual por serviço">Percentual (%)</option>
                  <option value="Sublocação">Sublocação (Fixo R$)</option>
                  <option value="Valor fixo por serviço">Valor Fixo (R$)</option>
                </select>
              </div>
              <div className="input-group">
                <label>Comissão ({formData.tipoComissao === 'Percentual por serviço' ? '%' : 'R$'})</label>
                <input disabled={somenteLeitura} type="text" value={formData.comissao} onChange={e => setFormData({...formData, comissao: e.target.value})} />
              </div>
            </div>
          </div>

          {!somenteLeitura && (
            <footer className="form-full-footer">
              <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn-save-full">Confirmar Profissional</button>
            </footer>
          )}
        </form>
      </div>
    </div>
  );
};

export default FormProfissional;