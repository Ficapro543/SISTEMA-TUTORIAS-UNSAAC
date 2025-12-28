import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../componentes/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../componentes/ui/tabs';
import { House, Settings, GraduationCap, UserCheck, LogOut } from 'lucide-react';

// Importación de Dashboards específicos
import AdminDashboard from './admin/AdminDashboard';
import TutorDashboard from './tutor/TutorDashboard';
import VerificadorDashboard from './verificador/VerificadorDashboard';

const Dashboard = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inicio');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Institucional Azul (Como en tu imagen) */}
      <header className="bg-[#003366] text-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/assets/unsaac-logo.png" alt="Logo" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">SISTEMA DE TUTORIAS UNSAAC</h1>
              <p className="text-xs text-blue-200 uppercase tracking-widest">Panel de Control</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium">{user?.nombre} {user?.apellido}</p>
              <p className="text-xs text-blue-300">{user?.roles?.join(' | ')}</p>
            </div>
            <Button variant="ghost" className="hover:bg-blue-800 text-white" onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border p-1 shadow-sm inline-flex">
            <TabsTrigger value="inicio"><House className="w-4 h-4 mr-2" /> Inicio</TabsTrigger>
            {hasRole('admin') && <TabsTrigger value="admin"><Settings className="w-4 h-4 mr-2" /> Administración</TabsTrigger>}
            {hasRole('tutor') && <TabsTrigger value="tutor"><GraduationCap className="w-4 h-4 mr-2" /> Tutorías</TabsTrigger>}
            {hasRole('verificador') && <TabsTrigger value="verificador"><UserCheck className="w-4 h-4 mr-2" /> Verificación</TabsTrigger>}
          </TabsList>

          <TabsContent value="inicio">
            {/* Aquí puedes poner las cards de bienvenida de tu código original */}
            <h2 className="text-2xl font-bold">Bienvenido al sistema, {user?.nombre}</h2>
          </TabsContent>

          <TabsContent value="admin"><AdminDashboard /></TabsContent>
          <TabsContent value="tutor"><TutorDashboard /></TabsContent>
          <TabsContent value="verificador"><VerificadorDashboard /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;