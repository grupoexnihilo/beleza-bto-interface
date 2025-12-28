import React from 'react';

const Agendamento = () => {
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
          <button className="btn-adicionar-agendamento">+ Novo Agendamento</button>
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
          <div className="coluna-profissional">
            <div className="prof-header">Marcos Silva</div>
            <div className="horarios-lista">
              <div className="slot-horario">08:00</div>
              <div className="slot-agendado confirmado">
                <span className="slot-cliente">David Emunaar</span>
                <span className="slot-servico">Corte + Barba</span>
                <div className="slot-status-mini">Pago</div>
              </div>
              <div className="slot-horario">09:00</div>
            </div>
          </div>

          <div className="coluna-profissional">
            <div className="prof-header">Felipe Araújo</div>
            <div className="horarios-lista">
              <div className="slot-horario">08:00</div>
              <div className="slot-horario">09:00</div>
              <div className="slot-agendado pendente">
                <span className="slot-cliente">João Pereira</span>
                <span className="slot-servico">Degradê</span>
                <div className="slot-status-mini">Pendente</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agendamento;