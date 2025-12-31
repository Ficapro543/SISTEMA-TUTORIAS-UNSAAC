import React from "react";
import logoUnsaac from "/logo_izquierdo.png";
import logoEscuela from "/logo_derecho.png";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-header-gradient relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/60 via-accent to-accent/60" />
        
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo UNSAAC - Izquierda */}
            <div className="flex items-center gap-3">
              <img
                src={logoUnsaac}
                alt="Logo UNSAAC"
                className="h-16 w-auto object-contain drop-shadow-lg"
              />
            </div>

            {/* Título Central */}
            <div className="flex-1 text-center px-4">
              <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground tracking-wide">
                SISTEMA DE TUTORÍAS
              </h1>
              <p className="text-primary-foreground/80 text-sm md:text-base font-medium tracking-widest">
                UNSAAC
              </p>
            </div>

            {/* Logo Escuela Profesional - Derecha */}
            <div className="flex items-center gap-3">
              <img
                src={logoEscuela}
                alt="Logo Escuela Profesional"
                className="h-16 w-auto object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;