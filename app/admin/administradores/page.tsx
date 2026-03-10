"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";

// Actualiza el tipo Admin para incluir email
interface Admin {
  id: string; // UID del usuario
  nombre: string;
  email?: string;
}

export default function RegistroAdministradores() {
  const [infoadmins, setInfoAdmins] = useState<Admin[]>([]);
  useEffect(() => {
    async function fetchAdmins() {
      const res = await fetch("/api/administradores");
      const data = await res.json();
      const admins = data.map((admin: any) => ({
        id: admin._id,
        nombre: admin.nombre,
        email: admin.email || "",
      }));
      setInfoAdmins(admins);
    }
    fetchAdmins();
  }, []);

  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    email: "",
    nombre: "",
    password: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [filtroNombre, setFiltroNombre] = useState("");
  const { user, loading: authLoading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authLoading) {
      toast({
        title: "Cargando...",
        description: "Verificando estado de autenticación.",
      });
      return;
    }
    if (!user) {
      toast({
        title: "Error",
        description: "Debe iniciar sesión para crear un administrador.",
        variant: "destructive",
      });
      return;
    }

    // Validar que los campos requeridos estén completos
    if (
      !formData.email ||
      !formData.nombre ||
      (!isEditing && !formData.password)
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Todos los campos son obligatorios",
      });
      return;
    }

    // Validar que la contraseña tenga al menos 8 caracteres si se ingresa
    if (
      formData.password &&
      formData.password.length > 0 &&
      formData.password.length < 8
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La contraseña debe tener al menos 8 caracteres",
      });
      return;
    }

    if (isEditing) {
      try {
        const updateData: any = {
          nombre: formData.nombre,
          email: formData.email,
        };
        if (formData.password && formData.password.length > 0) {
          updateData.password = formData.password;
        }
        await fetch(`/api/administradores/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });
        toast({
          title: "Administrador actualizado",
          description: `El administrador ${formData.nombre} ha sido actualizado correctamente`,
        });
        const res = await fetch("/api/administradores");
        const data = await res.json();
        const admins = data.map((admin: any) => ({
          id: admin._id,
          nombre: admin.nombre,
          email: admin.email || "",
        }));
        setInfoAdmins(admins);
        setShowModal(false);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error?.message || "No se pudo actualizar el administrador",
        });
      }
    } else {
      try {
        await fetch("/api/administradores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            nombre: formData.nombre,
            password: formData.password,
          }),
        });
        toast({
          title: "Administrador registrado",
          description: `El administrador ${formData.nombre} ha sido registrado correctamente`,
        });
        const res = await fetch("/api/administradores");
        const data = await res.json();
        const admins = data.map((admin: any) => ({
          id: admin._id,
          nombre: admin.nombre,
          email: admin.email || "",
        }));
        setInfoAdmins(admins);
        setShowModal(false);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error?.message || "No se pudo crear el administrador",
        });
      }
    }
    resetForm();
  };

  const handleOpenNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (admin: Admin) => {
    setFormData({
      id: admin.id,
      email: admin.email || "",
      nombre: admin.nombre,
      password: "",
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/administradores/${id}`, { method: "DELETE" });
      toast({
        title: "Administrador eliminado",
        description: "El administrador ha sido eliminado correctamente",
      });
      const res = await fetch("/api/administradores");
      const data = await res.json();
      const admins = data.map((admin: any) => ({
        id: admin._id,
        nombre: admin.nombre,
        email: admin.email || "",
      }));
      setInfoAdmins(admins);
      if (formData.id === id) {
        resetForm();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "No se pudo eliminar el administrador",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      email: "",
      nombre: "",
      password: "",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-700 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center">
            <Link href="/admin" className="mr-4">
              <Button variant="ghost" size="icon" className="text-white">
                <ArrowLeft />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Registro de Administradores</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row md:justify-between mb-4 gap-2">
          <Button
            onClick={handleOpenNew}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Agregar nuevo administrador
          </Button>
          <div className="flex items-center gap-2">
            <Label htmlFor="filtroNombre" className="mb-0">
              Filtrar por nombre:
            </Label>
            <Input
              id="filtroNombre"
              type="text"
              placeholder="Buscar administrador..."
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Lista de Administradores */}
          <Card>
            <CardHeader>
              <CardTitle>Administradores Registrados</CardTitle>
              <CardDescription>
                Lista de todos los administradores en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">UID</th>
                      <th className="text-left py-3 px-4">Nombre</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {infoadmins
                      .filter((admin) =>
                        admin.nombre
                          .toLowerCase()
                          .includes(filtroNombre.toLowerCase())
                      )
                      .map((admin) => (
                        <tr key={admin.id} className="border-b">
                          <td className="py-3 px-4">{admin.id}</td>
                          <td className="py-3 px-4">{admin.nombre}</td>
                          <td className="py-3 px-4">{admin.email}</td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(admin)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Eliminar Administrador
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    ¿Estás seguro de que deseas eliminar a este
                                    administrador? Esta acción no se puede
                                    deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(admin.id)}
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Editar Administrador" : "Nuevo Administrador"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Actualice la información del administrador"
                  : "Complete el formulario para registrar un nuevo administrador"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Administrador</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={
                      isEditing ? "Dejar en blanco para mantener la actual" : ""
                    }
                    required={!isEditing}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mínimo 8 caracteres
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Actualizar" : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
