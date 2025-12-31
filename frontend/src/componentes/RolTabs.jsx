import React from "react";
import { Home, Shield, BookOpen, ClipboardCheck } from "lucide-react";
import { cn } from "../lib/utils";

const tabs = [
  { id: "inicio", label: "INICIO", icon: Home },
  { id: "administrador", label: "ADMINISTRADOR", icon: Shield },
  { id: "tutor", label: "TUTOR", icon: BookOpen },
  { id: "verificador", label: "VERIFICADOR", icon: ClipboardCheck },
];

const RolTabs = ({ activeTab, onTabChange, userRoles }) => {
  const visibleTabs = tabs.filter(
    (tab) => tab.id === "inicio" || userRoles.includes(tab.id)
  );

  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-6">
        <nav className="flex items-center gap-1">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all",
                  "hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default RolTabs;