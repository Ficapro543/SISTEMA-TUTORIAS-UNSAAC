import React from "react";
import { User, Mail, BadgeCheck, Hash } from "lucide-react";

const WelcomePanel = ({ user }) => {
  return (
    <div className="bg-info-gradient rounded-xl p-6 md:p-8 shadow-sm border border-accent/20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Mensaje de Bienvenida */}
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-info-panel-foreground">
            ¡Bienvenido!
          </h2>
          <p className="text-xl md:text-2xl font-semibold text-primary">
            {user.nombre}
          </p>
          <p className="text-muted-foreground">
            Accede a las herramientas del sistema de tutorías
          </p>
        </div>

        {/* Información del Usuario */}
        <div className="flex flex-col gap-3 bg-card/50 backdrop-blur-sm rounded-lg p-4 min-w-[280px]">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
              <Hash className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Código</p>
              <p className="font-medium text-foreground">{user.codigo}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Correo</p>
              <p className="font-medium text-foreground">{user.correo}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent/20">
              <BadgeCheck className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rol Actual</p>
              <p className="font-semibold text-accent">{user.rol}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePanel;