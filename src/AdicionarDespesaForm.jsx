// Este é o NOVO ficheiro: /src/AdicionarDespesaForm.jsx
import React, { useState, useEffect } from 'react';
import './AdicionarDespesaForm.css';

// Props: 'user' vem do Firebase Auth, 'unidadeId' é a unidade selecionada no App.jsx
function AdicionarDespesaForm({ user, unidadeId, onBack }) {
  const [categorias, setCategorias] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);

  const today = new Date().toISOString().slice(0, 10);
  const [dataCompetencia, setDataCompetencia] = useState(today);
  const [dataPagamento, setDataPagamento] = useState(today);
  const [categoria, setCategoria] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Efeito para buscar os dados dos dropdowns (categorias, formas de pagamento)
  useEffect(() => {
    // Só busca se a unidade estiver selecionada
    if (unidadeId) {
      const fetchData = async () => {
        try {
          // Chama a nossa nova API, passando a unidade e o tipo
          const response = await fetch(`/api/getFormOptions?unidadeId=${unidadeId}&tipo=Despesa`);
          if (!response.ok) {
            throw new Error('Falha ao buscar dados do formulário');
          }
          const data = await response.json();
          setCategorias(data.categorias);
          setFormasPagamento(data.formasPagamento);
        } catch (error) {
          console.error("Erro ao buscar opções:", error);
          setMessage("Erro ao carregar opções. Tente novamente.");
        }
      };
      fetchData();
    }
  }, [unidadeId]); // Roda sempre que a unidade selecionada mudar

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Chama a nossa nova API de salvar
      const response = await fetch('/api/addLancamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unidadeId: unidadeId,
          emailOperador: user.email, // Passa o email do usuário logado
          dataCompetencia,
          dataPagamento,
          categoria,
          formaPagamento,
          descricao,
          valor,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao salvar despesa');
      }
      
      // Sucesso
      setMessage(data.message);
      // Limpa os campos
      setCategoria('');
      setFormaPagamento('');
      setDescricao('');
      setValor('');

    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
      setMessage(`Erro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container-despesa">
      <button onClick={onBack} className="back-button">← Voltar</button>
      <h3>Adicionar Despesas</h3>
      <form onSubmit={handleSubmit} className="despesa-form">
        <div className="form-row">
          <div className="form-group">
            <label>Data de Competência</label>
            <input type="date" value={dataCompetencia} onChange={e => setDataCompetencia(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Data de Pagamento</label>
            <input type="date" value={dataPagamento} onChange={e => setDataPagamento(e.target.value)} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Categoria</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)} required>
              <option value="">Selecione a categoria...</option>
              {/* Os dados agora vêm da API Neon */ }
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Forma de Pagamento</label>
            <select value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)} required>
              <option value="">Selecione a forma...</option>
              {/* Os dados agora vêm da API Neon */ }
              {formasPagamento.map(fp => <option key={fp.id} value={fp.id}>{fp.nome}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Valor</label>
          <input type="number" placeholder="0.00" value={valor} onChange={e => setValor(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Descrição</label>
          <input type="text" placeholder="Ex: Compra de café" value={descricao} onChange={e => setDescricao(e.target.value)} required />
        </div>
        
        <button type="submit" className="submit-button-despesa" disabled={isLoading}>
          {isLoading ? 'A Salvar...' : 'Salvar Despesa'}
        </button>
        {message && <p className="message-feedback">{message}</p>}
      </form>
    </div>
  );
}

export default AdicionarDespesaForm