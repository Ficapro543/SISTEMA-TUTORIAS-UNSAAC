import React from "react";
import { Settings, BookOpen, FolderCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../componentes/ui/card.jsx";
import { Button } from "../componentes/ui/button";

const cards = [
  {
    id: "administrador",
    title: "Panel Administración",
    description: "Gestiona usuarios, asignaciones, cronogramas y genera reportes del sistema de tutorías.",
    icon: Settings,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "tutor",
    title: "Panel Tutorías",
    description: "Registra sesiones de tutoría, da seguimiento a tus tutorados y gestiona tus actividades.",
    icon: BookOpen,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    id: "verificador",
    title: "Panel Evaluación",
    description: "Verifica y evalúa las sesiones de tutoría realizadas por los tutores asignados.",
    icon: FolderCheck,
    color: "text-accent",
    bgColor: "bg-accent/20",
  },
];

const QuickAccessCards = ({ onNavigate, userRoles }) => {
  const visibleCards = cards.filter((card) => userRoles.includes(card.id));

  if (visibleCards.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {visibleCards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.id}
            className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50"
          >
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center mb-3`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <CardTitle className="text-lg font-semibold text-foreground">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                {card.description}
              </CardDescription>
              <Button
                onClick={() => onNavigate(card.id)}
                variant="outline"
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                Ir a {card.title.split(" ")[1]}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QuickAccessCards;