import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import React from "react";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  menuItems: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
  }>;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  menuItems,
  onLogout,
}) => {
  const handleItemClick = (itemId: string) => {
    if (itemId === "contenedores") {
      window.location.href = "/admin/contenedores";
      return;
    }
    if (itemId === "camiones") {
      window.location.href = "/admin/camiones";
      return;
    }
    setActiveSection(itemId);
  };

  return (
    <aside className="hidden md:block w-64 bg-white rounded-lg shadow-md p-4 h-fit">
      <nav className="space-y-1">
        <Button
          variant={activeSection === "dashboard" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => setActiveSection("dashboard")}
        >
          Dashboard
        </Button>
        {menuItems
          .filter((item) => item.id !== "exportar")
          .map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleItemClick(item.id)}
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 mt-4"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </nav>
    </aside>
  );
};

export default Sidebar;
