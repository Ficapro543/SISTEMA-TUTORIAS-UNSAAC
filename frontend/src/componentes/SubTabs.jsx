import React from "react";
import { cn } from "../lib/utils";
import { Users, GitBranch, Calendar, FileText, BookMarked, GraduationCap, UserCheck } from "lucide-react";

const subTabsByRole = {
  inicio: [],
  administrador: [
    { id: "validar-usuarios", label: "Validar Usuarios", icon: Users },
    { id: "asignaciones", label: "Asignaciones", icon: GitBranch },
    { id: "cronogramas", label: "Cronogramas", icon: Calendar },
    { id: "reportes", label: "Reportes", icon: FileText },
  ],
  tutor: [],
  verificador: [
    { id: "tutorias-semestre", label: "Tutorías por Semestre", icon: BookMarked },
    { id: "tutorias-estudiante", label: "Tutorías por Estudiante", icon: GraduationCap },
    { id: "tutorias-tutor", label: "Tutorías por Tutor", icon: UserCheck },
  ],
};

const SubTabs = ({ activeRole, activeSubTab, onSubTabChange }) => {
  const subTabs = subTabsByRole[activeRole];

  if (!subTabs || subTabs.length === 0) {
    return null;
  }

  return (
    <div className="bg-muted/30 border-b border-border">
      <div className="container mx-auto px-6">
        <nav className="flex items-center gap-1 overflow-x-auto">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSubTabChange(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap",
                  "hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t-md",
                  isActive
                    ? "bg-background text-primary border-t border-x border-border -mb-px"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default SubTabs;
export { subTabsByRole };