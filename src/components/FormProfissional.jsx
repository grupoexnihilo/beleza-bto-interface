import React, { useState, useEffect } from 'react';
import './FormProfissional.css';

const FormProfissional = ({ onClose, onSave, profissionalExistente, somenteLeitura }) => {
  const [formData, setFormData] = useState({
    nome: '',
    contrato: 'PJ',
    documento: '',
    telefone: '',
    email: '',
    cep: '',
    rua: '',
    bairro: '',
    cidade: '',
    estado: '',
    numero: '',
    inicioContrato: '',
    servicos: [],
    tipoComissao: 'Percentual por serviço',
    comissao: '',
    status: 'Pendente'
  });

  const [novoServico, setNovoServico] = useState('');

  const ESTADOS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

  useEffect(() => {
    if (profissionalExistente) {
      setFormData(profissionalExistente);
    }
  }, [profissionalExistente]);

  // --- FUNÇÕES DE MÁSCARA E FORMATAÇÃO ---
  const maskPhone = (v) => {
    v = v.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1.$2");
    return v.substring(0, 15);
  };

  const maskDoc = (v, type) => {
    v = v.replace(/\D/g, "");
    if (type === 'CLT' || type === 'PF') {
      // Máscara de CPF
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4").substring(0, 14);
    } else {
      // Máscara de CNPJ
      return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5").substring(0, 18);
    }
  };

  const handleCEP = async (e) => {
    const cep = e.target.value.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, cep: cep }));

    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            rua: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const addServico = () => {
    if (novoServico.trim() && !formData.servicos.includes(novoServico.trim())) {
      setFormData({ ...formData, servicos: [...formData.servicos, novoServico.trim()] });
      setNovoServico('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!somenteLeitura) {
      onSave(formData);
    }
  };

  return (
    <div className="form-full-screen-overlay fade-in">
      <div className="form-full-screen-container">
        <header className="form-full-header">
          <div className="header-info">
            <span className="badge-categoria">RECURSOS HUMANOS</span>
            <h2>{somenteLeitura ? 'Ficha Técnica' : (profissionalExistente ? 'Editar Cadastro' : 'Novo Colaborador')}</h2>
            <p>Gerencie as informações detalhadas do profissional e suas condições contratuais.</p>
          </div>
          <button className="btn-close-full" onClick={onClose}>&times;</button>
        </header>

        <form className="form-full-body" onSubmit={handleSubmit}>
          
          {/* SEÇÃO 1: CONTRATO */}
          <div className="form-section">
            <h4 className="section-title">Dados Contratuais e Status</h4>
            <div className="full-grid">
              <div className="input-group">
                <label>Tipo de Contrato</label>
                <select disabled={somenteLeitura} value={formData.contrato} onChange={e => setFormData({...formData, contrato: e.target.value, documento: ''})}>
                  <option value="CLT">CLT (Registro)</option>
                  <option value="PJ">PJ (Empresa)</option>
                  <option value="PF">Profissional Liberal (CPF)</option>
                </select>
              </div>
              <div className="input-group">
                <label>{formData.contrato === 'PJ' ? 'CNPJ' : 'CPF'}</label>
                <input 
                  disabled={somenteLeitura} 
                  type="text" 
                  value={formData.documento} 
                  onChange={e => setFormData({...formData, documento: maskDoc(e.target.value, formData.contrato)})} 
                  placeholder={formData.contrato === 'PJ' ? "00.000.000/0000-00" : "000.000.000-00"}
                />
              </div>
              <div className="input-group">
                <label>Data de Início</label>
                <input disabled={somenteLeitura} type="date" value={formData.inicioContrato} onChange={e => setFormData({...formData, inicioContrato: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Status de Atividade</label>
                <select disabled={somenteLeitura} className={formData.status.toLowerCase()} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Ativo">🟢 Ativo</option>
                  <option value="Pendente">🟡 Pendente</option>
                  <option value="Inativo">🔴 Inativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: PESSOAL */}
          <div className="form-section">
            <h4 className="section-title">Informações Pessoais de Contato</h4>
            <div className="full-grid">
              <div className="input-group span-2">
                <label>Nome Completo do Profissional</label>
                <input disabled={somenteLeitura} type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Nome completo sem abreviações" />
              </div>
              <div className="input-group">
                <label>Telefone / WhatsApp</label>
                <input disabled={somenteLeitura} type="text" value={formData.telefone} onChange={e => setFormData({...formData, telefone: maskPhone(e.target.value)})} placeholder="(00) 0 0000.0000" />
              </div>
              <div className="input-group">
                <label>E-mail Profissional</label>
                <input disabled={somenteLeitura} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="exemplo@email.com" />
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: ENDEREÇO */}
          <div className="form-section">
            <h4 className="section-title">Localização e Endereço</h4>
            <div className="full-grid">
              <div className="input-group">
                <label>CEP</label>
                <input 
                  disabled={somenteLeitura}
                  type="text" 
                  maxLength="8"
                  placeholder="00000000"
                  value={formData.cep} 
                  onChange={handleCEP} 
                />
              </div>
              <div className="input-group">
                <label>Rua / Logradouro</label>
                <input disabled={somenteLeitura} type="text" value={formData.rua} onChange={e => setFormData({...formData, rua: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Bairro</label>
                <input disabled={somenteLeitura} type="text" value={formData.bairro} onChange={e => setFormData({...formData, bairro: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Cidade</label>
                <input disabled={somenteLeitura} type="text" value={formData.cidade} onChange={e => setFormData({...formData, cidade: e.target.value})} />
              </div>
              <div className="input-group">
                <label>UF (Estado)</label>
                <select disabled={somenteLeitura} value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})}>
                  <option value="">Selecione a UF</option>
                  {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Número e Complemento</label>
                <input disabled={somenteLeitura} type="text" placeholder="Nº 123, Bloco A" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} />
              </div>
            </div>
          </div>

          {/* SEÇÃO 4: SERVIÇOS E COMISSÃO */}
          <div className="form-section">
            <h4 className="section-title">Especialidades e Comissionamento</h4>
            <div className="full-grid">
              <div className="input-group span-2">
                <label>Serviços Habilitados (Digite e clique em Adicionar)</label>
                <div className="tag-input-container">
                  <input 
                    disabled={somenteLeitura} 
                    type="text" 
                    value={novoServico} 
                    onChange={e => setNovoServico(e.target.value)} 
                    placeholder="Ex: Corte de Cabelo, Manicure..." 
                  />
                  <button type="button" onClick={addServico} disabled={somenteLeitura}>Adicionar</button>
                </div>
                <div className="tags-display">
                  {formData.servicos.length > 0 ? (
                    formData.servicos.map(s => (
                      <span key={s} className="tag-item">
                        {s} 
                        {!somenteLeitura && <i onClick={() => setFormData({...formData, servicos: formData.servicos.filter(x => x !== s)})}>&times;</i>}
                      </span>
                    ))
                  ) : (
                    <p style={{ color: '#444', fontSize: '0.8rem' }}>Nenhum serviço vinculado ainda.</p>
                  )}
                </div>
              </div>
              <div className="input-group">
                <label>Modelo de Ganhos</label>
                <select disabled={somenteLeitura} value={formData.tipoComissao} onChange={e => setFormData({...formData, tipoComissao: e.target.value, comissao: ''})}>
                  <option value="Percentual por serviço">Comissão Percentual (%)</option>
                  <option value="Sublocação">Sublocação (Fixo Mensal)</option>
                  <option value="Valor fixo por serviço">Taxa Fixa por Serviço (R$)</option>
                </select>
              </div>
              <div className="input-group">
                <label>Valor da Comissão ({formData.tipoComissao === 'Percentual por serviço' ? '%' : 'R$'})</label>
                <input disabled={somenteLeitura} type="text" value={formData.comissao} onChange={e => setFormData({...formData, comissao: e.target.value})} placeholder="0.00" />
              </div>
            </div>
          </div>

          {!somenteLeitura && (
            <footer className="form-full-footer">
              <button type="button" className="btn-cancel" onClick={onClose}>Descartar Alterações</button>
              <button type="submit" className="btn-save-full">Salvar Dados do Profissional</button>
            </footer>
          )}
        </form>
      </div>
    </div>
  );
};

export default FormProfissional;