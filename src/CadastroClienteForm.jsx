import React, { useState, useEffect } from 'react';
import './CadastroClienteForm.css';

function CadastroClienteForm({ user, unidadeId, unidades, onBack }) {
  const [loading, setLoading] = useState(false);
  const [cidades, setCidades] = useState([]);
  const [loadingCidades, setLoadingCidades] = useState(false);

  const [formData, setFormData] = useState({
    nome: '', whatsapp: '', data_nascimento: '', cpf: '',
    email: '', endereco: '', numero: '', complemento: '', 
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

  // Lógica Condicional: Busca cidades ao selecionar o Estado
  useEffect(() => {
    if (formData.estado) {
      setLoadingCidades(true);
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.estado}/municipios`)
        .then(res => res.json())
        .then(data => {
          const nomesCidades = data.map(mun => mun.nome).sort();
          setCidades(nomesCidades);
          setLoadingCidades(false);
        })
        .catch(err => {
          console.error("Erro ao buscar cidades:", err);
          setLoadingCidades(false);
        });
    } else {
      setCidades([]);
    }
  }, [formData.estado]);

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
        alert('Ficha do cliente salva com sucesso!');
        onBack();
      } else {
        const data = await response.json();
        alert('Erro ao salvar: ' + data.message);
      }
    } catch (err) {
      alert('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <button onClick={onBack} className="back-button">← Voltar ao Painel</button>
      <h3>Ficha Cadastral do Cliente</h3>
      
      <form onSubmit={handleSubmit} className="entrada-form">
        
        {/* LINHA 1: Unidade e CPF */}
        <div className="form-row">
          <div className="form-group">
            <label>Unidade de Atendimento</label>
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

        {/* LINHA 2: Nome e WhatsApp */}
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

        {/* LINHA 3: Email e Nascimento */}
        <div className="form-row">
          <div className="form-group">
            <label>E-mail</label>
            <input 
              type="email" placeholder="exemplo@email.com"
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

        <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '10px 0' }} />

        {/* LINHA 4: Endereço (Rua, Nº, Complemento) */}
        <div className="form-row" style={{ gridTemplateColumns: '2fr 0.5fr 1fr' }}>
          <div className="form-group">
            <label>Rua / Logradouro</label>
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
              type="text"
              value={formData.complemento}
              onChange={(e) => setFormData({...formData, complemento: e.target.value})}
            />
          </div>
        </div>

        {/* LINHA 5: Bairro, Estado e Cidade (Condicional) */}
        <div className="form-row" style={{ gridTemplateColumns: '1.5fr 0.8fr 1.5fr' }}>
          <div className="form-group">
            <label>Bairro</label>
            <input 
              type="text"
              value={formData.bairro}
              onChange={(e) => setFormData({...formData, bairro: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Estado (UF)</label>
            <select 
              value={formData.estado} 
              onChange={(e) => setFormData({...formData, estado: e.target.value, cidade: ''})}
            >
              <option value="">UF</option>
              {estados.map(uf => <option key={uf.sigla} value={uf.sigla}>{uf.sigla}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Cidade</label>
            <select 
              value={formData.cidade} 
              disabled={!formData.estado || loadingCidades}
              onChange={(e) => setFormData({...formData, cidade: e.target.value})}
            >
              <option value="">{loadingCidades ? 'Carregando cidades...' : 'Selecione a cidade'}</option>
              {cidades.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* LINHA 6: Atividade / Histórico */}
        <div className="form-group">
          <label>Atividade (Observações, Histórico de Saúde e Preferências)</label>
          <textarea 
            rows="5" 
            placeholder="Descreva aqui detalhes importantes sobre o atendimento deste cliente..."
            value={formData.atividade}
            onChange={(e) => setFormData({...formData, atividade: e.target.value})}
          />
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Salvando...' : 'Finalizar Cadastro Profissional'}
        </button>
      </form>
    </div>
  );
}

export default CadastroClienteForm;