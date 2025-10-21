import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from './firebaseConfig.js';
import './EntradaRapidaForm.css';

function EntradaRapidaForm({ user, unidade, onBack }) {
  const [colaboradores, setColaboradores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  
  const today = new Date().toISOString().slice(0, 10);
  const [dataCompetencia, setDataCompetencia] = useState(today);
  const [dataPagamento, setDataPagamento] = useState(today);
  const [colaborador, setColaborador] = useState('');
  const [categoria, setCategoria] = useState('');
  const [dinheiro, setDinheiro] = useState('');
  const [pix, setPix] = useState('');
  const [credito, setCredito] = useState('');
  const [debito, setDebito] = useState('');
  const [outros, setOutros] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const db = getFirestore(app);

  useEffect(() => {
    const fetchData = async () => {
      if (!unidade) return;
      
      const colabQuery = query(collection(db, "colaboradores"), where("empresa", "==", unidade));
      const colabSnapshot = await getDocs(colabQuery);
      setColaboradores(colabSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      const catQuery = query(collection(db, "categorias"), where("tipo", "==", "Receita"));
      const catSnapshot = await getDocs(catQuery);
      setCategorias(catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, [unidade, db]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    const functions = getFunctions(app, 'southamerica-east1');
    const adicionarLancamentos = httpsCallable(functions, 'adicionarLancamentos');

    try {
      const result = await adicionarLancamentos({
        unidade: unidade,
        dataCompetencia: dataCompetencia,
        dataPagamento: dataPagamento,
        colaborador: colaborador,
        categoria: categoria,
        dinheiro: parseFloat(dinheiro) || 0,
        pix: parseFloat(pix) || 0,
        credito: parseFloat(credito) || 0,
        debito: parseFloat(debito) || 0,
        outros: parseFloat(outros) || 0,
      });
      
      setMessage(result.data.message);
      setDinheiro('');
      setPix('');
      setCredito('');
      setDebito('');
      setOutros('');
    } catch (error) {
      console.error("Erro ao chamar a Cloud Function:", error);
      setMessage(`Erro: ${error.message}`);
    }
    setIsLoading(false);
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
              {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Categoria</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)} required>
              <option value="">Selecione...</option>
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.categoria}</option>)}
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

export default EntradaRapidaForm;

