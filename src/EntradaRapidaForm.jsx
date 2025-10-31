// --- VERSÃO COM ENVIO DE DATA UTC ISOString ---
import React, { useState, useEffect } from 'react';
import './EntradaRapidaForm.css';

function EntradaRapidaForm({ user, unidadeId, onBack }) {
  // --- Estados ---
  const [colaboradores, setColaboradores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const today = new Date().toISOString().slice(0, 10);
  const [dataCompetencia, setDataCompetencia] = useState(today);
  const [dataPagamento, setDataPagamento] = useState(today);
  const [colaborador, setColaborador] = useState(''); // Guarda ID
  const [categoria, setCategoria] = useState(''); // Guarda Nome
  const [dinheiro, setDinheiro] = useState('');
  const [pix, setPix] = useState('');
  const [credito, setCredito] = useState('');
  const [debito, setDebito] = useState('');
  const [outros, setOutros] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // --- Efeito para buscar opções ---
  useEffect(() => {
    if (unidadeId) {
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/getFormOptions?unidadeId=${unidadeId}&tipo=Receita`);
          if (!response.ok) throw new Error('Falha ao buscar dados do formulário');
          const data = await response.json();
          setColaboradores(data.colaboradores || []);
          setCategorias(data.categorias || []);
        } catch (error) {
          console.error("Erro ao buscar opções:", error);
          setMessage("Erro ao carregar opções. Tente novamente.");
        }
      };
      fetchData();
    }
  }, [unidadeId]);

  // --- Cálculo Soma Total ---
  const calcularSomaTotal = () => { /* ... código mantido ... */ };
  const somaTotal = calcularSomaTotal();

  // --- Handler de Submit (com conversão UTC) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Agrupa pagamentos
    const pagamentos = { dinheiro, pix, credito, debito, outros };
    // Verifica se pelo menos um valor foi inserido
    const algumValorInserido = Object.values(pagamentos).some(valStr => parseFloat(valStr || '0') > 0);
    if (!algumValorInserido) {
        setMessage("Erro: Insira pelo menos um valor de pagamento.");
        setIsLoading(false);
        return;
    }


    try {
      // --- CONVERSÃO PARA UTC ISOString ---
      const dataCompetenciaUTC = dataCompetencia ? new Date(dataCompetencia + 'T00:00:00.000Z').toISOString() : null;
      const dataPagamentoFinal = dataPagamento || dataCompetencia;
      const dataPagamentoUTC = dataPagamentoFinal ? new Date(dataPagamentoFinal + 'T00:00:00.000Z').toISOString() : null;
      // --- FIM CONVERSÃO ---

      if (!dataCompetenciaUTC || !dataPagamentoUTC) {
          throw new Error("Data inválida selecionada.");
      }

      const response = await fetch('/api/addLancamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unidadeId: unidadeId,
          emailOperador: user.email,
          dataCompetencia: dataCompetenciaUTC, // <-- Envia ISOString
          dataPagamento: dataPagamentoUTC,   // <-- Envia ISOString
          colaborador, // ID do colaborador
          categoria,   // Nome da categoria
          pagamentos, // Objeto {dinheiro: '10', pix: '20', ...}
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao salvar receitas');
      }

      setMessage(data.message); // Mensagem de sucesso
      // Limpa apenas os valores após sucesso
      setDinheiro('');
      setPix('');
      setCredito('');
      setDebito('');
      setOutros('');
      // Mantém data, colaborador, categoria para facilitar

    } catch (error) {
      console.error("Erro ao chamar a API de salvar receitas:", error);
      setMessage(`Erro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- JSX ---
  return (
    <div className="form-container">
      <button onClick={onBack} className="back-button">← Voltar</button>
      <h3>Adicionar Receitas</h3>
      <form onSubmit={handleSubmit} className="entrada-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="rec-dataCompetencia">Data de Competência</label>
            <input type="date" id="rec-dataCompetencia" value={dataCompetencia} onChange={e => setDataCompetencia(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="rec-dataPagamento">Data de Pagamento</label>
            <input type="date" id="rec-dataPagamento" value={dataPagamento} onChange={e => setDataPagamento(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="rec-colaborador">Colaborador</label>
            <select id="rec-colaborador" value={colaborador} onChange={e => setColaborador(e.target.value)} required>
              <option value="">Selecione...</option>
              {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="rec-categoria">Categoria</label>
            <select id="rec-categoria" value={categoria} onChange={e => setCategoria(e.target.value)} required>
              <option value="">Selecione...</option>
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
            </select>
          </div>
        </div>
        <hr />
        <h4>Valores por Forma de Pagamento</h4>
        <div className="form-row">
          <div className="form-group"> <label htmlFor="rec-dinheiro">Dinheiro</label> <input type="number" step="0.01" placeholder="0.00" id="rec-dinheiro" value={dinheiro} onChange={e => setDinheiro(e.target.value)} /> </div>
          <div className="form-group"> <label htmlFor="rec-pix">Pix</label> <input type="number" step="0.01" placeholder="0.00" id="rec-pix" value={pix} onChange={e => setPix(e.target.value)} /> </div>
          <div className="form-group"> <label htmlFor="rec-credito">Crédito</label> <input type="number" step="0.01" placeholder="0.00" id="rec-credito" value={credito} onChange={e => setCredito(e.target.value)} /> </div>
          <div className="form-group"> <label htmlFor="rec-debito">Débito</label> <input type="number" step="0.01" placeholder="0.00" id="rec-debito" value={debito} onChange={e => setDebito(e.target.value)} /> </div>
          <div className="form-group"> <label htmlFor="rec-outros">Outros</label> <input type="number" step="0.01" placeholder="0.00" id="rec-outros" value={outros} onChange={e => setOutros(e.target.value)} /> </div>
        </div>

        {/* Display da Soma Total */}
        <div className="soma-total-display">
          <h4>Total Lançado:</h4>
          <span className="valor-total-calculado">
            {somaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'A Salvar...' : 'Salvar Lançamentos'}
        </button>
        {message && <p className="message-feedback">{message}</p>}
      </form>
    </div>
  );
}

// Helper fora do componente (para evitar recriação)
const calcularSomaTotal = (din, px, cr, db, ot) => {
    const valores = [din, px, cr, db, ot];
    let soma = 0;
    valores.forEach(valorStr => {
      const valorNum = parseFloat(valorStr || '0');
      if (!isNaN(valorNum)) { soma += valorNum; }
    });
    return soma;
};


export default EntradaRapidaForm;