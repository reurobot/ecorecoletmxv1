"use client";

import { useState, useEffect } from "react"; // Importa useEffect
import Link from "next/link";
import { useRouter } from "next/navigation"; // Importa useRouter
import { useAuth } from "@/context/AuthContext"; // Importa useAuth
import { useToast } from "@/hooks/use-toast";

import {
  Users,
  Store,
  Trash2,
  FileText,
  FileDown,
  LogOut,
  Menu,
  QrCode,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import GeneratorQR from "./generatorqr/page";
import TablaLocales from "./locales/page";
import ConfirmacionRecolecciones from "./confirmacion/page";
import Reportes from "./reportes/page";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Sidebar from "./Sidebar";

// Cambiamos el nombre de la función a algo más genérico si es necesario,
// o mantenemos AdminPanel si esa es su función principal una vez protegido.
export default function AdminPage() {
  const { user, rol, loading, logout } = useAuth(); // Usa el hook useAuth
  const router = useRouter(); // Usa el hook useRouter
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filtroChofer, setFiltroChofer] = useState("");
  const [showRecolectModal, setShowRecolectModal] = useState(false);
  const [recolectForm, setRecolectForm] = useState({
    chofer: "",
    camion: "",
    contenedores: 1,
  });

  // useEffect para la protección de ruta
  useEffect(() => {
    // Si todavía estamos cargando el estado de autenticación/rol, no hacemos nada.
    if (loading) {
      return;
    }

    // Si loading es false, verificamos si el usuario no tiene acceso.
    if (!user || rol !== "admin") {
      console.log("Acceso denegado a /admin. Redirigiendo..."); // Opcional
      router.push("/"); // Redirige a la página de login si no es admin
    }
  }, [user, rol, loading, router]); // Dependencias del useEffect

  // Mostrar un indicador de carga o null mientras se verifica la autenticación y rol
  // Si el usuario no tiene permiso, también mostramos esto mientras se redirige.
  if (loading || !user || rol !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Verificando permisos...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
    await logout(); // Llama a la función logout del contexto
  };

  const menuItems = [
    {
      id: "usuarios",
      label: "Registro de Usuarios",
      icon: <Users className="mr-2 h-5 w-5" />,
    },
    {
      id: "contenedores",
      label: "Configurar Contenedores",
      icon: <Trash2 className="mr-2 h-5 w-5" />,
      href: "/admin/contenedores",
    },
    {
      id: "camiones",
      label: "Configurar Camiones",
      icon: <Store className="mr-2 h-5 w-5" />,
      href: "/admin/camiones",
    },
    {
      id: "reportes",
      label: "Reportes",
      icon: <FileText className="mr-2 h-5 w-5" />,
    },
    {
      id: "generatorqr",
      label: "Generar QR",
      icon: <QrCode className="mr-2 h-5 w-5" />,
    },
    {
      id: "confirmacion",
      label: "Confirmación",
      icon: <CheckCircle className="mr-2 h-5 w-5" />,
    },
    {
      id: "locales",
      label: "Locales",
      icon: <Store className="mr-2 h-5 w-5" />,
    },
  ];

  const mockRecolect = [
    {
      chofer: "Juan Pérez",
      camion: "CAM-001",
      contenedores: 5,
      pago: true,
      status: "completado",
    },
    {
      chofer: "Luis García",
      camion: "CAM-002",
      contenedores: 3,
      pago: false,
      status: "pendiente",
    },
    {
      chofer: "Ana Torres",
      camion: "CAM-003",
      contenedores: 7,
      pago: true,
      status: "completado",
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "usuarios":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Registro de Usuarios</h2>
              <div className="flex space-x-2">
                <Link href="/admin/choferes">
                  <Button variant="outline">Choferes</Button>
                </Link>
                <Link href="/admin/administradores">
                  <Button variant="outline">Administradores</Button>
                </Link>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Usuarios Registrados</CardTitle>
                <CardDescription>
                  Lista de todos los usuarios en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Seleccione "Choferes" o "Administradores" para gestionar
                  usuarios.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case "contenedores":
        // Considera usar router.push en lugar de window.location.href para navegación dentro de Next.js
        window.location.href = "/admin/contenedores";
        return null;
      case "reportes":
        return <Reportes />;
      case "generatorqr":
        return <GeneratorQR />;
      case "confirmacion":
        return <ConfirmacionRecolecciones />;
      case "locales":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Locales Registrados</h2>
            <TablaLocales />
          </div>
        );
      default: // Dashboard o cualquier otra sección por defecto
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Panel de Administración</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {" "}
              {menuItems.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    // Considera usar router.push en lugar de window.location.href
                    if (item.href) {
                      window.location.href = item.href;
                    } else {
                      setActiveSection(item.id);
                    }
                  }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {item.icon}
                      {item.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Acceda a la gestión de {item.label.toLowerCase()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
    }
  };

  const handleRecolectFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Añadido tipo para el evento
    const { name, value } = e.target;
    setRecolectForm((prev) => ({
      ...prev,
      [name]: name === "contenedores" ? Number(value) : value,
    }));
  };

  const handleRecolectFormSubmit = (e: React.FormEvent) => {
    // Añadido tipo para el evento
    e.preventDefault();
    if (
      !recolectForm.chofer ||
      !recolectForm.camion ||
      !recolectForm.contenedores ||
      recolectForm.contenedores <= 0 // Añadida validación básica
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Todos los campos son obligatorios y la cantidad de contenedores debe ser mayor a 0", // Mensaje actualizado
      });
      return;
    }
    // mockRecolect.push({...}); // No modificar directamente el estado de un array mock así
    // Deberías agregar esto a un estado o enviarlo a tu backend/Firestore

    setShowRecolectModal(false);
    setRecolectForm({ chofer: "", camion: "", contenedores: 1 });
    toast({
      title: "Recolección agregada",
      description: `Se agregó la recolección de ${recolectForm.chofer}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            EcoRecolectMexico - Panel de Administración
          </h1>
          {/* Mobile menu button */}
          <div className="flex items-center space-x-4 md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="py-4">
                  <h2 className="text-lg font-bold mb-4 px-4">Menú</h2>
                  <nav className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setActiveSection("dashboard");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Dashboard
                    </Button>{" "}
                    {menuItems.map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          // Considera usar router.push en lugar de window.location.href
                          if (item.href) {
                            window.location.href = item.href;
                          } else {
                            setActiveSection(item.id);
                            setIsMobileMenuOpen(false);
                          }
                        }}
                      >
                        {item.icon}
                        {item.label}
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-500"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Cerrar Sesión
                    </Button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          {/* Desktop logout button */}
          <Button
            variant="ghost"
            className="hidden md:flex items-center text-white hover:bg-green-800"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Cerrar Sesión
          </Button>
        </div>
      </header>
      <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">
        {/* Sidebar - Desktop only */}
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          menuItems={menuItems}
          onLogout={handleLogout}
        />
        {/* Main content */}
        <main className="flex-1 bg-white rounded-lg shadow-md p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
