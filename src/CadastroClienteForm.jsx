import React, { useState, useEffect } from 'react';
import './CadastroClienteForm.css';

function CadastroClienteForm({ user, unidadeId, unidades, onBack }) {
  const [loading, setLoading] = useState(false);
  const [cidades, setCidades] = useState([]);
  const [loadingCidades, setLoadingCidades] = useState(false);

  // Puxa a data atual no formato YYYY-MM-DD
  const dataHoje = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    data_cadastro: dataHoje,
    nome: '', whatsapp: '', email: '', cpf: '', data_nascimento: '',
    cep: '', endereco: '', numero: '', complemento: '', 
    bairro: '', cidade: '', estado: '', atividade: ''
  });

  const unidadeAtual = unidades.find(u => u.id === unidadeId);

  const estados = [
    { sigla: 'AC' }, { sigla: 'AL' }, { sigla: 'AP' }, { sigla: 'AM' }, { sigla: 'BA' }, 
    { sigla: 'CE' }, { sigla: 'DF' }, { sigla: 'ES' }, { sigla: 'GO' }, { sigla: 'MA' }, 
    { sigla: 'MT' }, { sigla: 'MS' }, { sigla: 'MG' }, { sigla: 'PA' }, { sigla: 'PB' }, 
    { sigla: 'PR' }, { sigla: 'PE' }, { sigla: 'PI' }, { sigla: 'RJ' }, { sigla: 'RN' }, 
    { sigla: 'RS' }, { sigla: 'RO' }, { sigla: 'RR' }, { sigla: 'SC' }, { sigla: 'SP' }, 
    { sigla: 'SE' }, { sigla: 'TO' }
  ];

  const handleCEPBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: data.logradouro,
            bairro: data.bairro,
            estado: data.uf,
            cidade: data.localidade
          }));
        }
      } catch (err) { console.error("Erro CEP"); }
    }
  };

  useEffect(() => {
    if (formData.estado) {
      setLoadingCidades(true);
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.estado}/municipios`)
        .then(res => res.json())
        .then(data => {
          setCidades(data.map(mun => mun.nome).sort());
          setLoadingCidades(false);
        })
        .catch(() => setLoadingCidades(false));
    }
  }, [formData.estado]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...formData, id: `cli_${crypto.randomUUID().substring(0, 8)}`, unidade: unidadeId, cadastrado_por: user?.email };
    try {
      const response = await fetch('/api/cadastrar-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) { alert('Cliente Cadastrado com Sucesso!'); onBack(); }
    } catch (err) { alert('Erro na conexão'); }
    finally { setLoading(false); }
  };

  return (
    <div className="form-container">
      <button onClick={onBack} className="back-button">← Voltar</button>
      <h3>Ficha Cadastral do Cliente</h3>
      
      <form onSubmit={handleSubmit} className="entrada-form">
        
        {/* Data Cadastro e Unidade */}
        <div className="form-row">
          <div className="form-group">
            <label>Data de Cadastro</label>
            <input type="date" value={formData.data_cadastro} onChange={(e) => setFormData({...formData, data_cadastro: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Unidade</label>
            <input type="text" value={unidadeAtual?.nome || ''} disabled />
          </div>
        </div>

        {/* Nome e WhatsApp */}
        <div className="form-row">
          <div className="form-group">
            <label>Nome Completo</label>
            <input type="text" required value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
          </div>
          <div className="form-group">
            <label>WhatsApp</label>
            <input type="text" required value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} />
          </div>
        </div>

        {/* Email e CPF */}
        <div className="form-row">
          <div className="form-group">
            <label>E-mail</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>CPF</label>
            <input type="text" value={formData.cpf} onChange={(e) => setFormData({...formData, cpf: e.target.value})} />
          </div>
        </div>

        {/* CEP, Endereço e Nº */}
        <div className="form-row" style={{ gridTemplateColumns: '1fr 2fr 0.5fr' }}>
          <div className="form-group">
            <label>CEP (Busca Automática)</label>
            <input type="text" onBlur={handleCEPBlur} onChange={(e) => setFormData({...formData, cep: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Endereço</label>
            <input type="text" value={formData.endereco} onChange={(e) => setFormData({...formData, endereco: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Nº</label>
            <input type="text" value={formData.numero} onChange={(e) => setFormData({...formData, numero: e.target.value})} />
          </div>
        </div>

        {/* Complemento e Bairro */}
        <div className="form-row">
          <div className="form-group">
            <label>Complemento</label>
            <input type="text" value={formData.complemento} onChange={(e) => setFormData({...formData, complemento: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Bairro</label>
            <input type="text" value={formData.bairro} onChange={(e) => setFormData({...formData, bairro: e.target.value})} />
          </div>
        </div>

        {/* Estado e Cidade */}
        <div className="form-row">
          <div className="form-group">
            <label>Estado</label>
            <select value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value, cidade: ''})}>
              <option value="">UF</option>
              {estados.map(uf => <option key={uf.sigla} value={uf.sigla}>{uf.sigla}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Cidade</label>
            <select value={formData.cidade} onChange={(e) => setFormData({...formData, cidade: e.target.value})} disabled={!formData.estado}>
              <option value="">{loadingCidades ? '...' : formData.cidade || 'Selecione'}</option>
              {cidades.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Observação / Histórico</label>
          <textarea rows="4" value={formData.atividade} onChange={(e) => setFormData({...formData, atividade: e.target.value})} />
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Salvando...' : 'Finalizar Cadastro Profissional'}
        </button>
      </form>
    </div>
  );
}

export default CadastroClienteForm;