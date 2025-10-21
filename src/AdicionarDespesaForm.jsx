import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import app from './firebaseConfig.js';
import './AdicionarDespesaForm.css';

function AdicionarDespesaForm({ user, unidade, onBack }) {
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

  const db = getFirestore(app);

  useEffect(() => {
    const fetchData = async () => {
      const catQuery = query(collection(db, "categorias"), where("tipo", "==", "Despesa"));
      const catSnapshot = await getDocs(catQuery);
      setCategorias(catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const formasCollection = await getDocs(collection(db, "formas_de_pagamento"));
      setFormasPagamento(formasCollection.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, [db]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('Ação de salvar despesa ainda a ser implementada com Cloud Function.');
    // Lógica futura para chamar a Cloud Function
    setIsLoading(false);
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
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.categoria}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Forma de Pagamento</label>
            <select value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)} required>
              <option value="">Selecione a forma...</option>
              {formasPagamento.map(fp => <option key={fp.id} value={fp.id}>{fp.nome_da_forma}</option>)}
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

export default AdicionarDespesaForm;

