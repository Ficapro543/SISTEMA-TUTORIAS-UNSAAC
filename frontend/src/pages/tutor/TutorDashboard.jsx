import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { FiEdit2, FiPrinter, FiPlus, FiCalendar, FiClock, FiMapPin, FiSearch } from 'react-icons/fi';
import MainHeader from '../../componentes/MainHeader';
import RegisterTutoriaModal from '../../componentes/RegisterTutoriaModal';

const TutorDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [cronogramas, setCronogramas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCronograma, setSelectedCronograma] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // --- Mock Data fallback if API fails or is empty for dev visual check ---
    const MOCK_CRONOGRAMAS = [
        {
            cronograma_id: '1',
            nombre_estudiante: 'Juan',
            apellido_estudiante: 'Perez',
            codigo_estudiante: '160456',
            fecha: '2025-05-12',
            hora: '10:00:00',
            ambiente: 'Aula 302',
            tutoria_id: null // Pendiente
        },
        {
            cronograma_id: '2',
            nombre_estudiante: 'Maria',
            apellido_estudiante: 'Gomez',
            codigo_estudiante: '182345',
            fecha: '2025-05-14',
            hora: '11:00:00',
            ambiente: 'Cubiculo 1',
            tutoria_id: 'uuid-123' // Completada
        }
    ];

    useEffect(() => {
        const fetchUserAndCronogramas = async () => {
             // 1. Get User
             const storedUser = localStorage.getItem('user');
             if (!storedUser) {
                 // For dev, verify if we can proceed without login or redirect
                 // navigate('/login'); 
                 // return;
                 // Set mock user for visual testing
                 setUser({ name: 'John Smith', email: 'john@unsaac.edu.pe' });
             } else {
                 setUser(JSON.parse(storedUser));
             }

             // 2. Fetch Cronogramas
             try {
                 setLoading(true);
                 const parsedUser = storedUser ? JSON.parse(storedUser) : {id: 'mock-id'};
                 // Assuming API works, otherwise catch block will use mock
                 const response = await api.get(`/cronogramas/tutor/${parsedUser.id}`);
                 setCronogramas(response.data.length > 0 ? response.data : MOCK_CRONOGRAMAS);
             } catch (error) {
                 console.log("Using Mock Data due to API error:", error);
                 setCronogramas(MOCK_CRONOGRAMAS);
             } finally {
                 setLoading(false);
             }
        };

        fetchUserAndCronogramas();
    }, []);

    // Handle Registration Click
    const handleRegisterClick = (cronograma) => {
        setSelectedCronograma(cronograma);
        setIsModalOpen(true);
    };

    // Handle "Mock" Success (Update UI immediately)
    const handleModalConfirm = () => {
        if (!selectedCronograma) return;
        
        // Optimistic UI Update: Set tutoria_id to simulate completion
        const updatedCronogramas = cronogramas.map(c => 
            c.cronograma_id === selectedCronograma.cronograma_id 
            ? { ...c, tutoria_id: 'mock-new-id' } 
            : c
        );
        setCronogramas(updatedCronogramas);
        setIsModalOpen(false);
    };

    const formatDate = (dateStr) => {
        if(!dateStr) return '';
        const date = new Date(dateStr);
        // E.g., 12/05/2025
        return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Filter
    const filtered = cronogramas.filter(c => 
        (c.nombre_estudiante + ' ' + c.apellido_estudiante).toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.codigo_estudiante.includes(searchTerm)
    );

    return (
        <div className="min-h-screen font-[Poppins] flex flex-col">
            <MainHeader user={user} />

            {/* Gradient Background Container */}
            <div className="flex-1 bg-gradient-to-b from-[#E0F2FE] to-white px-4 md:px-12 py-10">
                
                {/* Title Section */}
                <div className="max-w-7xl mx-auto mb-8">
                    <h2 className="text-[#002147] text-3xl font-bold uppercase tracking-wide">Panel de Tutor</h2>
                    <p className="text-gray-600 text-lg mt-1 font-light">
                        ¡Bienvenido, <span className="font-semibold text-[#002147]">{user?.name}</span>!
                    </p>
                </div>

                {/* Main Card */}
                <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden min-h-[500px]">
                    
                    {/* Toolbar */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-gray-700 font-bold text-lg">Cronograma de Sesiones</h3>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Buscar estudiante..." 
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#002147] focus:border-transparent outline-none w-64 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-center w-32 border-r border-gray-200">Fecha</th>
                                    <th className="px-6 py-4 font-bold text-center w-24 border-r border-gray-200">Hora</th>
                                    <th className="px-6 py-4 font-bold text-center w-32 border-r border-gray-200">Aula</th>
                                    <th className="px-6 py-4 font-bold border-r border-gray-200">Estudiante</th>
                                    <th className="px-6 py-4 font-bold text-center w-64">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-8 text-center">Cargando...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">No se encontraron tutorías.</td></tr>
                                ) : filtered.map((item, idx) => (
                                    <tr key={item.cronograma_id} className={`hover:bg-blue-50/30 transition-colors border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                        
                                        {/* Fecha */}
                                        <td className="px-6 py-4 text-center border-r border-gray-100 font-medium">
                                            {formatDate(item.fecha)}
                                        </td>
                                        
                                        {/* Hora */}
                                        <td className="px-6 py-4 text-center border-r border-gray-100">
                                            {item.hora}
                                        </td>

                                        {/* Aula */}
                                        <td className="px-6 py-4 text-center border-r border-gray-100 text-[#002147] font-semibold">
                                            {item.ambiente}
                                        </td>

                                        {/* Estudiante */}
                                        <td className="px-6 py-4 border-r border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#002147] flex items-center justify-center font-bold text-xs">
                                                    {item.nombre_estudiante.charAt(0)}{item.apellido_estudiante.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{item.nombre_estudiante} {item.apellido_estudiante}</p>
                                                    <p className="text-xs text-gray-500">{item.codigo_estudiante}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Acciones Logic */}
                                        <td className="px-6 py-4 text-center">
                                            {!item.tutoria_id ? (
                                                // Estado Pendiente: + Registrar
                                                <button 
                                                    onClick={() => handleRegisterClick(item)}
                                                    className="w-full bg-[#002147] hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                                                >
                                                    <FiPlus size={16} /> Registrar Tutoría
                                                </button>
                                            ) : (
                                                // Estado Completado: Editar + Imprimir
                                                <div className="flex gap-2 justify-center">
                                                    <button 
                                                        className="bg-[#EAB308] hover:bg-yellow-600 text-white p-2 rounded-md shadow-sm transition-colors flex-1 flex justify-center items-center gap-1 font-medium text-xs"
                                                        title="Editar Tutoría"
                                                    >
                                                        <FiEdit2 size={14} /> Editar
                                                    </button>
                                                    <button 
                                                        className="bg-[#002147] hover:bg-blue-900 text-white p-2 rounded-md shadow-sm transition-colors flex-1 flex justify-center items-center gap-1 font-medium text-xs"
                                                        title="Imprimir Constancia"
                                                    >
                                                        <FiPrinter size={14} /> Imprimir
                                                    </button>
                                                </div>
                                            )}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <RegisterTutoriaModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                cronograma={selectedCronograma}
                onSaveSuccess={handleModalConfirm}
            />

        </div>
    );
};

export default TutorDashboard;