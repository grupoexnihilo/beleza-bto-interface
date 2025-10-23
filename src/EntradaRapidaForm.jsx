// Este é o NOVO ficheiro: /src/EntradaRapidaForm.jsx
import React, { useState, useEffect } from 'react';
import './EntradaRapidaForm.css';

// Props: 'user' do Auth, 'unidadeId' do App.jsx, 'onBack' para voltar
function EntradaRapidaForm({ user, unidadeId, onBack }) {
  const [colaboradores, setColaboradores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  
  const today = new Date().toISOString().slice(0, 10);
  const [dataCompetencia, setDataCompetencia] = useState(today);
  const [dataPagamento, setDataPagamento] = useState(today);
  const [colaborador, setColaborador] = useState(''); // Vai guardar o ID do colaborador
  const [categoria, setCategoria] = useState('');     // Vai guardar o nome da Categoria

  const [dinheiro, setDinheiro] = useState('');
  const [pix, setPix] = useState('');
  const [credito, setCredito] = useState('');
  const [debito, setDebito] = useState('');
  const [outros, setOutros] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Efeito para buscar os dados dos dropdowns (colaboradores, categorias)
  useEffect(() => {
    const fetchData = async () => {
      if (!unidadeId) return; // Não faz nada se a unidade não estiver selecionada
      
      try {
        // Chama a nossa nova API, passando a unidade e o tipo
        const response = await fetch(`/api/getFormOptions?unidadeId=${unidadeId}&tipo=Receita`);
        if (!response.ok) {
          throw new Error('Falha ao buscar dados do formulário');
        }
        const data = await response.json();
        setColaboradores(data.colaboradores);
        setCategorias(data.categorias);

      } catch (error) {
        console.error("Erro ao buscar opções:", error);
        setMessage("Erro ao carregar opções. Tente novamente.");
      }
    };
    fetchData();
  }, [unidadeId]); // Roda sempre que a unidade selecionada mudar

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const pagamentos = {
      dinheiro: parseFloat(dinheiro) || 0,
      pix: parseFloat(pix) || 0,
      credito: parseFloat(credito) || 0,
      debito: parseFloat(debito) || 0,
      outros: parseFloat(outros) || 0,
    };

    try {
      // Chama a nossa nova API de salvar múltiplos lançamentos
      const response = await fetch('/api/addLancamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unidadeId: unidadeId,
          emailOperador: user.email,
          dataCompetencia,
          dataPagamento,
          colaborador, // id_do_colaborador
          categoria,
          pagamentos, // Objeto com todos os valores
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao salvar receitas');
      }

      // Sucesso
      setMessage(data.message);
      // Limpa os campos de valor
      setDinheiro('');
      setPix('');
      setCredito('');
      setDebito('');
      setOutros('');
      // Não limpa categoria ou colaborador, para facilitar o próximo lançamento

    } catch (error) {
      console.error("Erro ao chamar a API de salvar receitas:", error);
      setMessage(`Erro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <button onClick={onBack} className="back-button">← Voltar</button>
      <h3>Adicionar Receitas</h3>
      <form onSubmit={handleSubmit} className="entrada-form">
        <div className="form-row">
          <div className="form-group">
            <label>Data de Competência</label>
            <input type="date" value={dataCompetencia} onChange={e => setDataCompetencia(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Data de Pagamento</label>
            <input type="date" value={dataPagamento} onChange={e => setDataPagamento(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Colaborador</label>
            <select value={colaborador} onChange={e => setColaborador(e.target.value)} required>
              <option value="">Selecione...</option>
              {/* Dados da API Neon */ }
              {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Categoria</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)} required>
              <option value="">Selecione...</option>
              {/* Dados da API Neon */ }
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
            </select>
          </div>
        </div>
        <hr />
        <h4>Valores por Forma de Pagamento</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Dinheiro</label>
            <input type="number" placeholder="0.00" value={dinheiro} onChange={e => setDinheiro(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Pix</label>
            <input type="number" placeholder="0.00" value={pix} onChange={e => setPix(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Crédito</label>
            <input type="number" placeholder="0.00" value={credito} onChange={e => setCredito(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Débito</label>
            <input type="number" placeholder="0.00" value={debito} onChange={e => setDebito(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Outros</label>
            <input type="number" placeholder="0.00" value={outros} onChange={e => setOutros(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'A Salvar...' : 'Salvar Lançamentos'}
        </button>
        {message && <p className="message-feedback">{message}</p>}
  </form>
    </div>
  );
}

export default EntradaRapidaForm