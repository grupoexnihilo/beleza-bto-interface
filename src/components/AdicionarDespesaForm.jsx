// --- VERSÃO COM ENVIO DE DATA UTC ISOString ---
import React, { useState, useEffect } from 'react';
import './AdicionarDespesaForm.css';

function AdicionarDespesaForm({ user, unidadeId, onBack }) {
  // --- Estados ---
  const [categorias, setCategorias] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const [dataCompetencia, setDataCompetencia] = useState(today);
  const [dataPagamento, setDataPagamento] = useState(today);
  const [categoria, setCategoria] = useState('');
  const [formaPagamento, setFormaPagamento] = useState(''); // Guarda o ID
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // --- Efeito para buscar opções ---
  useEffect(() => {
    if (unidadeId) {
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/getFormOptions?unidadeId=${unidadeId}&tipo=Despesa`);
          if (!response.ok) throw new Error('Falha ao buscar dados do formulário');
          const data = await response.json();
          setCategorias(data.categorias || []); // Garante array
          setFormasPagamento(data.formasPagamento || []); // Garante array
        } catch (error) {
          console.error("Erro ao buscar opções:", error);
          setMessage("Erro ao carregar opções. Tente novamente.");
        }
      };
      fetchData();
    }
  }, [unidadeId]);

  // --- Handler de Submit (com conversão UTC) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // --- CONVERSÃO PARA UTC ISOString ---
      // Adiciona T00:00:00.000Z para interpretar como UTC antes de toISOString()
      const dataCompetenciaUTC = dataCompetencia ? new Date(dataCompetencia + 'T00:00:00.000Z').toISOString() : null;
      const dataPagamentoFinal = dataPagamento || dataCompetencia; // Usa competencia se pagamento estiver vazio
      const dataPagamentoUTC = dataPagamentoFinal ? new Date(dataPagamentoFinal + 'T00:00:00.000Z').toISOString() : null;
      // --- FIM CONVERSÃO ---

      // Verifica se as datas foram convertidas corretamente
      if (!dataCompetenciaUTC || !dataPagamentoUTC) {
          throw new Error("Data inválida selecionada.");
      }

      const response = await fetch('/api/addLancamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unidadeId: unidadeId,
          emailOperador: user.email,
          dataCompetencia: dataCompetenciaUTC, // <-- Envia ISOString
          dataPagamento: dataPagamentoUTC,   // <-- Envia ISOString
          categoria, // Nome da categoria
          formaPagamento, // ID da forma de pagamento
          descricao,
          valor,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao salvar despesa');
      }

      setMessage(data.message); // Mensagem de sucesso
      // Limpa campos após sucesso
      // setCategoria(''); // Pode manter para facilitar próximo lançamento
      // setFormaPagamento(''); // Pode manter
      setDescricao('');
      setValor('');
      // setDataCompetencia(today); // Opcional: resetar datas
      // setDataPagamento(today);

    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
      setMessage(`Erro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- JSX ---
  return (
    <div className="form-container-despesa">
      <button onClick={onBack} className="back-button">← Voltar</button>
      <h3>Adicionar Despesas</h3>
      <form onSubmit={handleSubmit} className="despesa-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="desp-dataCompetencia">Data de Competência</label>
            <input type="date" id="desp-dataCompetencia" value={dataCompetencia} onChange={e => setDataCompetencia(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="desp-dataPagamento">Data de Pagamento</label>
            <input type="date" id="desp-dataPagamento" value={dataPagamento} onChange={e => setDataPagamento(e.target.value)} />
          </div>
        </div>
        {/* Força Categoria e FormaPagamento a ficarem empilhados (removido .form-row aqui) */}
        <div className="form-group">
          <label htmlFor="desp-categoria">Categoria</label>
          <select id="desp-categoria" value={categoria} onChange={e => setCategoria(e.target.value)} required>
            <option value="">Selecione a categoria...</option>
            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="desp-formaPagamento">Forma de Pagamento</label>
          <select id="desp-formaPagamento" value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)} required>
            <option value="">Selecione a forma...</option>
            {formasPagamento.map(fp => <option key={fp.id} value={fp.id}>{fp.nome}</option>)}
          </select>
        </div>
        {/* Fim do empilhamento forçado */}
        <div className="form-group">
          <label htmlFor="desp-valor">Valor</label>
          <input type="number" step="0.01" placeholder="0.00" id="desp-valor" value={valor} onChange={e => setValor(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="desp-descricao">Descrição</label>
          <input type="text" placeholder="Ex: Compra de café" id="desp-descricao" value={descricao} onChange={e => setDescricao(e.target.value)} required />
        </div>

        <button type="submit" className="submit-button-despesa" disabled={isLoading}>
          {isLoading ? 'A Salvar...' : 'Salvar Despesa'}
        </button>
        {message && <p className="message-feedback">{message}</p>}
      </form>
    </div>
  );
}

export default AdicionarDespesaForm;