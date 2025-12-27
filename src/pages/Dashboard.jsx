import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar Simples */}
      <nav className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-5xl mx-auto flex items-center space-x-2">
          <LayoutDashboard className="text-indigo-600" />
          <span className="font-bold text-xl text-gray-800">Beleza BTO</span>
        </div>
      </nav>

      <main className="flex-grow p-6 max-w-5xl mx-auto w-full">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Bem-vindo(a)</h1>
          <p className="text-gray-500">O que deseja fazer hoje?</p>
        </header>

        {/* Grid de Botões */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Botão Adicionar Cliente */}
          <button
            onClick={() => navigate('/cadastrar')}
            className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
          >
            <div className="bg-indigo-50 p-4 rounded-full mb-4 group-hover:bg-indigo-100 transition-colors">
              <UserPlus className="text-indigo-600" size={32} />
            </div>
            <span className="text-lg font-semibold text-gray-800">Adicionar Cliente</span>
            <span className="text-sm text-gray-400 mt-1 text-center">Cadastrar novo perfil no sistema</span>
          </button>

          {/* Botão Base de Clientes (Placeholder) */}
          <button
            onClick={() => navigate('/clientes')}
            className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-300 transition-all group"
          >
            <div className="bg-teal-50 p-4 rounded-full mb-4 group-hover:bg-teal-100 transition-colors">
              <Users className="text-teal-600" size={32} />
            </div>
            <span className="text-lg font-semibold text-gray-800">Base de Clientes</span>
            <span className="text-sm text-gray-400 mt-1 text-center">Ver e editar clientes existentes</span>
          </button>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;