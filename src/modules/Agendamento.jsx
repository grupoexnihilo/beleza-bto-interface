import React, { useState } from 'react'; // Ajuste 1: Importando o useState
import './Agendamento.css';
import ModalComanda from '../components/ModalComanda'; // Ajuste 2: Importando o Componente do Modal

const Agendamento = () => {
  // Estado para controlar a abertura da comanda
  const [comandaAberta, setComandaAberta] = useState(null);

  // --- BLOCO NOVO: LÓGICA DO AJUSTE 15 (PRÓXIMO NÚMERO) ---
  const abrirNovoAgendamento = async () => {
    try {
      // 1. Chamada para a API que você criou na pasta /api
      // O '999' é o ID da unidade de exemplo
      const resposta = await fetch('/api/get-proxima-comanda?unidadeId=999');
      const dados = await resposta.json();
      
      // 2. Aqui montamos o objeto da comanda com o número vindo do Neon
      setComandaAberta({
        comanda: dados.numero.toString().padStart(4, '0'), // Transforma 1 em "0001"
        cliente: "Novo Cliente",
        telefone: "---",
        status: "pendente",
        data: new Date().toISOString(),
        profissional: "Selecione...",
        servico: "Selecione...",
        valorServico: 0.00,
        situacaoPagamento: "Pendente"
      });
    } catch (error) {
      console.error("Erro ao buscar próximo número:", error);
      // Caso a API falhe, abrimos com um padrão para não travar o sistema
      setComandaAberta({ comanda: "ERRO", cliente: "Novo Cliente" });
    }
  };
  // --- FIM DO BLOCO NOVO ---  

  // Função simples para formatar a data dentro do modal
  const formatarDataModal = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <div className="modulo-agendamento">
      {/* HEADER DA AGENDA */}
      <div className="agenda-header-actions">
        <div className="agenda-nav-group">
          <button className="btn-agenda-nav">◀</button>
          <span className="agenda-data-foco">Sábado, 28 de Dezembro</span>
          <button className="btn-agenda-nav">▶</button>
        </div>

        <div className="agenda-view-controls">
          <button className="btn-view-toggle active">👥 Por Profissional</button>
          <button className="btn-view-toggle">📅 Grade</button>
          <button 
            className="btn-adicionar-agendamento" 
            onClick={abrirNovoAgendamento}
          >
            + Novo Agendamento
          </button>
        </div>
      </div>

      {/* FILTROS RÁPIDOS */}
      <div className="agenda-filtros-bar">
        <select className="agenda-select"><option>Todos os Profissionais</option></select>
        <select className="agenda-select"><option>Todos os Serviços</option></select>
        <select className="agenda-select"><option>Manhã</option><option>Tarde</option><option>Noite</option></select>
      </div>

      {/* ÁREA DA AGENDA (VISÃO POR PROFISSIONAL) */}
      <div className="agenda-container-scroll">
        <div className="agenda-grid-profissionais">
          
          {/* COLUNA 1 */}
          <div className="coluna-profissional">
            <div className="prof-header">Marcos Silva</div>
            <div className="horarios-lista">
              <div className="slot-horario">08:00</div>
              <div className="slot-agendado confirmado" onClick={() => setComandaAberta({
                  comanda: "5501",
                  cliente: "David Emunaar",
                  telefone: "(11) 98888-0000",
                  status: "confirmado",
                  data: new Date().toISOString(),
                  profissional: "Marcos Silva",
                  servico: "Corte + Barba",
                  valorServico: 85.00,
                  situacaoPagamento: "Pago"
              })}>
                <span className="slot-cliente">David Emunaar</span>
                <span className="slot-servico">Corte + Barba</span>
                <div className="slot-status-mini">Pago</div>
              </div>
              <div className="slot-horario">09:00</div>
            </div>
          </div>

          {/* COLUNA 2 */}
          <div className="coluna-profissional">
            <div className="prof-header">Felipe Araújo</div>
            <div className="horarios-lista">
              <div className="slot-horario">08:00</div>
              <div className="slot-horario">09:00</div>
              <div className="slot-agendado pendente" onClick={() => setComandaAberta({
                  comanda: "5502",
                  cliente: "João Pereira",
                  telefone: "(11) 97777-1111",
                  status: "pendente",
                  data: new Date().toISOString(),
                  profissional: "Felipe Araújo",
                  servico: "Degradê",
                  valorServico: 45.00,
                  situacaoPagamento: "Pendente"
              })}>
                <span className="slot-cliente">João Pereira</span>
                <span className="slot-servico">Degradê</span>
                <div className="slot-status-mini">Pendente</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* RENDERIZAÇÃO DO MODAL (Sempre no final do container principal) */}
      {comandaAberta && (
        <ModalComanda 
          agendamento={comandaAberta} 
          aoFechar={() => setComandaAberta(null)} 
          aoExcluir={(id) => console.log("Excluir", id)}
          formatarData={formatarDataModal} 
        />
      )}
    </div>
  );
};

export default Agendamento;