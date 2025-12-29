import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiChevronDown, FiMenu } from 'react-icons/fi';

const MainHeader = ({ user }) => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Handle user data from props or fallback to mock
    const currentUser = {
        name: user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}` : "John Smith"),
        email: user?.email || "johnsmith@gmail.com",
        avatar: user?.avatar || null
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="w-full font-[Poppins]">
            {/* 1. Top Bar - Navy Blue */}
            <header className="bg-[#002147] text-white px-8 py-3 flex items-center justify-between">
                {/* Left: Logo UNSAAC */}
                <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-1.5 rounded-full">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/2/23/Logo_unsaac.png"
                            alt="UNSAAC Logo"
                            className="w-10 h-10 object-contain"
                            onError={(e) => { e.target.style.display = 'none' }}
                        />
                    </div>
                </div>

                {/* Center: Title */}
                <h1 className="text-xl md:text-2xl font-bold tracking-wide text-center uppercase">
                    Sistema de Tutorías UNSAAC
                </h1>

                {/* Right: Institutional Shield (Placeholder) */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center opacity-80">
                        {/* Placeholder for shield - using logo again if needed or empty */}
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/2/23/Logo_unsaac.png"
                            alt="Escudo"
                            className="w-10 h-10 object-contain grayscale opacity-50"
                        />
                    </div>
                </div>
            </header>

            {/* 2. Secondary Navbar - White */}
            <nav className="bg-white shadown-sm border-b border-gray-200 px-8 py-0 flex items-center justify-between h-16 relative z-40">

                {/* Nav Links */}
                <div className="flex items-center gap-8 h-full">
                    <a href="#" className="h-full flex items-center text-gray-500 font-semibold text-sm hover:text-[#002147] transition-colors border-b-2 border-transparent">
                        INICIO
                    </a>
                    <a href="#" className="h-full flex items-center text-gray-500 font-semibold text-sm hover:text-[#002147] transition-colors border-b-2 border-transparent">
                        ADMINISTRADOR
                    </a>
                    <a href="#" className="h-full flex items-center text-[#002147] font-bold text-sm border-b-4 border-[#002147]">
                        TUTOR
                    </a>
                    <a href="#" className="h-full flex items-center text-gray-500 font-semibold text-sm hover:text-[#002147] transition-colors border-b-2 border-transparent">
                        VERIFICADOR
                    </a>
                </div>

                {/* User Profile */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 hover:bg-gray-50 py-2 px-3 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                    >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                            {currentUser.avatar ? (
                                <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#002147] text-white text-sm font-bold">
                                    {currentUser.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <span className="text-sm font-bold text-gray-800 leading-none">{currentUser.name}</span>
                            <span className="text-[10px] text-gray-500">{currentUser.email}</span>
                        </div>
                        <FiChevronDown className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 text-gray-700 z-50 animate-fade-in-up">
                            <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-sm">
                                <FiUser /> Mi Perfil
                            </button>
                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 text-sm">
                                <FiLogOut /> Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>

                {/* Overlay for dropdown */}
                {isDropdownOpen && (
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsDropdownOpen(false)}></div>
                )}

            </nav>
        </div>
    );
};

export default MainHeader;
