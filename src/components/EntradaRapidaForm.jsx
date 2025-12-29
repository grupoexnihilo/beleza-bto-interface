// --- VERSÃO CORRIGIDA (Fix 'toLocaleString' bug) ---
import React, { useState, useEffect } from 'react';
import './EntradaRapidaForm.css';

// Função para formatar a data para YYYY-MM-DD
const getHojeFormatado = () => {
  const agora = new Date();
  // Ajusta para o fuso horário de Brasília (UTC-3)
  const offset = -3 * 60; 
  const dataLocal = new Date(agora.getTime() + (offset * 60 * 1000));
  return dataLocal.toISOString().split('T')[0];
};

function EntradaRapidaForm({ user, unidadeId, onBack }) {
  const [categorias, setCategorias] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]); // Embora não usado, mantém consistência
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // --- Estados do Formulário ---
  const [dataCompetencia, setDataCompetencia] = useState(getHojeFormatado());
  const [categoria, setCategoria] = useState('');
  const [colaborador, setColaborador] = useState('');
  const [pagamentos, setPagamentos] = useState({
    dinheiro: '',
    pix: '',
    credito: '',
    debito: '',
    outros: '',
  });

  // --- ESTA É A CORREÇÃO ---
  // O total deve começar como 0, não como undefined.
  const [total, setTotal] = useState(0); 
  // --- FIM DA CORREÇÃO ---

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Efeito para buscar opções do formulário
  useEffect(() => {
    const fetchOptions = async () => {
      if (!unidadeId) return;
      setIsLoadingOptions(true);
      try {
        const response = await fetch(`/api/getFormOptions?unidadeId=${unidadeId}&tipo=Receita`);
        if (!response.ok) throw new Error('Falha ao buscar opções');
        const data = await response.json();
        setCategorias(data.categorias || []);
        setColaboradores(data.colaboradores || []);
        setFormasPagamento(data.formasPagamento || []); // Armazena FPs
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    fetchOptions();
  }, [unidadeId]);

  // Efeito para calcular o total
  useEffect(() => {
    try {
      const valores = Object.values(pagamentos).map(val => parseFloat(val || 0));
      const soma = valores.reduce((acc, v) => acc + v, 0);
      setTotal(soma); // Atualiza o total
    } catch (e) {
      console.error("Erro ao calcular total:", e);
      setTotal(0); // Garante que não falhe
    }
  }, [pagamentos]); // Recalcula sempre que 'pagamentos' mudar

  const handlePagamentoChange = (e) => {
    const { name, value } = e.target;
    // Permite apenas números e um ponto decimal
    if (/^[0-9]*\.?[0-9]*$/.test(value)) {
      setPagamentos(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const resetForm = () => {
    setPagamentos({ dinheiro: '', pix: '', credito: '', debito: '', outros: '' });
    setCategoria('');
    setColaborador('');
    // Mantém a data para o próximo lançamento
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (total <= 0) {
      setError("O valor total deve ser maior que zero.");
      return;
    }
    if (!categoria || !colaborador) {
      setError("Categoria e Profissional são obrigatórios.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Converte a data (YYYY-MM-DD) para ISOString UTC
    const dataCompetenciaUTC = new Date(dataCompetencia + 'T00:00:00.000Z').toISOString();

    const payload = {
      unidadeId,
      emailOperador: user.email,
      dataCompetencia: dataCompetenciaUTC,
      dataPagamento: dataCompetenciaUTC, // Assumindo pagamento no mesmo dia
      colaborador,
      categoria,
      pagamentos, // Envia o objeto de pagamentos
    };

    try {
      const response = await fetch('/api/addLancamentos', { // Chama a API de Receitas
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Erro ${response.status}`);
      }
      
      setSuccess(data.message || "Receita salva com sucesso!");
      resetForm();
      
    } catch (err) {
      setError(err.message || "Ocorreu um erro ao salvar.");
      console.error("Erro no handleSubmit:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoadingOptions) {
    return <div className="loading-options">A carregar opções do formulário...</div>;
  }

  return (
    <div className="form-container-wrapper">
      <button onClick={onBack} className="back-button">← Voltar ao Painel</button>
      <form onSubmit={handleSubmit} className="entrada-rapida-form">
        <h2>Adicionar Receita</h2>
        
        {error && <p className="mensagem erro">{error}</p>}
        {success && <p className="mensagem sucesso">{success}</p>}

        {/* --- Linha 1: Data, Categoria, Profissional --- */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dataCompetencia">Data</label>
            <input
              type="date"
              id="dataCompetencia"
              value={dataCompetencia}
              onChange={(e) => setDataCompetencia(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="categoria">Categoria</label>
            <select id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
              <option value="">Selecione a categoria</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="colaborador">Profissional</label>
            <select id="colaborador" value={colaborador} onChange={(e) => setColaborador(e.target.value)} required>
              <option value="">Selecione o profissional</option>
              {colaboradores.map(colab => (
                <option key={colab.id} value={colab.id}>{colab.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* --- Linha 2: Formas de Pagamento --- */}
        <fieldset className="pagamentos-fieldset">
          <legend>Formas de Pagamento (R$)</legend>
          <div className="form-row pagamentos-grid">
            <div className="form-group">
              <label htmlFor="dinheiro">Dinheiro</label>
              <input type="text" id="dinheiro" name="dinheiro" value={pagamentos.dinheiro} onChange={handlePagamentoChange} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label htmlFor="pix">Pix</label>
              <input type="text" id="pix" name="pix" value={pagamentos.pix} onChange={handlePagamentoChange} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label htmlFor="credito">Crédito</label>
              <input type="text" id="credito" name="credito" value={pagamentos.credito} onChange={handlePagamentoChange} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label htmlFor="debito">Débito</label>
              <input type="text" id="debito" name="debito" value={pagamentos.debito} onChange={handlePagamentoChange} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label htmlFor="outros">Outros</label>
              <input type="text" id="outros" name="outros" value={pagamentos.outros} onChange={handlePagamentoChange} placeholder="0.00" />
            </div>
          </div>
        </fieldset>

        {/* --- Linha 3: Total e Botão --- */}
        <div className="form-footer">
          <div className="total-display">
            <h3>Total:</h3>
            {/* Adicionado fallback (total || 0) para robustez extra */}
            <span>{(total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
          <button type="submit" className="submit-button" disabled={isLoading || total <= 0}>
            {isLoading ? 'A Salvar...' : 'Salvar Receita'}
          </button>
        </div>
        
      </form>
    </div>
  );
}

export default EntradaRapidaForm;