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
import CamionSelect from "@/components/CamionSelect";

export default function RegistroChoferes() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    uid: "",
    email: "",
    nombre: "",
    password: "",
    camion: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [filtroNombre, setFiltroNombre] = useState("");

  const [choferes, setChoferes] = useState<any[]>([]);
  useEffect(() => {
    async function fetchChoferes() {
      try {
        const res = await fetch("/api/choferes");
        const data = await res.json();
        setChoferes(Array.isArray(data) ? data : []);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error?.message || "No se pudo obtener la lista de choferes",
        });
      }
    }
    fetchChoferes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validar que todos los campos estén completos (excepto password en edición)
    if (
      !formData.email ||
      !formData.nombre ||
      (!isEditing && !formData.password)
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Todos los campos son obligatorios (excepto camión y contraseña al editar)",
      });
      return;
    }
    if (!isEditing && formData.password.length < 8) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La contraseña debe tener al menos 8 caracteres",
      });
      return;
    }
    try {
      if (isEditing) {
        const updateChoferUser = httpsCallable(functions, "updateChoferUser");
        await updateChoferUser({
          uid: formData.uid,
          email: formData.email,
          nombre: formData.nombre,
          password: formData.password || undefined,
          camion: formData.camion,
        });
        toast({
          title: "Chofer actualizado",
          description: `El chofer ${formData.nombre} ha sido actualizado correctamente`,
        });
      } else {
        const createChoferUser = httpsCallable(functions, "createChoferUser");
        await createChoferUser({
          email: formData.email, // El email es el identificador
          nombre: formData.nombre,
          password: formData.password,
          camion: formData.camion,
        });
        toast({
          title: "Chofer registrado",
          description: `El chofer ${formData.nombre} ha sido registrado correctamente`,
        });
      }
      // Refrescar la lista de choferes usando Cloud Function
      const getChoferes = httpsCallable(functions, "getChoferes");
      const result = await getChoferes();
      setChoferes(Array.isArray(result.data) ? result.data : []);
      setShowModal(false);
      resetForm();
      setIsEditing(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "No se pudo guardar el chofer",
      });
    }
  };

  const handleOpenNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (chofer: any) => {
    setFormData({
      uid: chofer.id,
      email: chofer.email || "",
      nombre: chofer.nombre || "",
      password: "", // No mostramos la contraseña por seguridad
      camion: chofer.camion || "",
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (uid: string) => {
    try {
      const deleteChoferUser = httpsCallable(functions, "deleteChoferUser");
      await deleteChoferUser({ uid });
      toast({
        title: "Chofer eliminado",
        description: "El chofer ha sido eliminado correctamente",
      });
      // Refrescar la lista de choferes
      const getChoferes = httpsCallable(functions, "getChoferes");
      const result = await getChoferes();
      setChoferes(Array.isArray(result.data) ? result.data : []);
      // Si estábamos editando el chofer que acabamos de eliminar, limpiar el formulario
      if (formData.uid === uid) {
        resetForm();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "No se pudo eliminar el chofer",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      uid: "",
      email: "",
      nombre: "",
      password: "",
      camion: "",
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
            <h1 className="text-xl font-bold">Registro de Choferes</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row md:justify-between mb-4 gap-2">
          <Button
            onClick={handleOpenNew}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Agregar nuevo chofer
          </Button>
          <div className="flex items-center gap-2">
            <Label htmlFor="filtroNombre" className="mb-0">
              Filtrar por nombre:
            </Label>
            <Input
              id="filtroNombre"
              type="text"
              placeholder="Buscar chofer..."
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Lista de Choferes */}
          <Card>
            <CardHeader>
              <CardTitle>Choferes Registrados</CardTitle>
              <CardDescription>
                Lista de todos los choferes en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">UID</th>
                      <th className="text-left py-3 px-4">Correo</th>
                      <th className="text-left py-3 px-4">Nombre</th>
                      <th className="text-left py-3 px-4">Camión Asignado</th>
                      <th className="text-left py-3 px-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {choferes
                      .filter((chofer) =>
                        (chofer.nombre || "")
                          .toLowerCase()
                          .includes(filtroNombre.toLowerCase())
                      )
                      .map((chofer) => (
                        <tr key={chofer.id} className="border-b">
                          <td className="py-3 px-4">{chofer.id}</td>
                          <td className="py-3 px-4">
                            {chofer.email || chofer.numeroControl || ""}
                          </td>
                          <td className="py-3 px-4">{chofer.nombre}</td>
                          <td className="py-3 px-4">{chofer.camion}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(chofer)}
                              >
                                Editar
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      ¿Está seguro?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. Esto
                                      eliminará permanentemente al chofer{" "}
                                      {chofer.nombre}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-500 hover:bg-red-600"
                                      onClick={() => handleDelete(chofer.id)}
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
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
                {isEditing ? "Editar Chofer" : "Nuevo Chofer"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Actualice la información del chofer"
                  : "Complete el formulario para registrar un nuevo chofer"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  // El correo debe ser editable tanto en creación como en edición
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Chofer</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="camion">Camión Asignado</Label>
                <CamionSelect
                  value={formData.camion}
                  onChange={(camion) =>
                    setFormData((prev) => ({
                      ...prev,
                      camion: camion?.id || "",
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Contraseña {isEditing ? "(opcional)" : ""}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  minLength={isEditing ? 0 : 8}
                  placeholder={
                    isEditing ? "Dejar en blanco para no cambiar" : ""
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff /> : <Eye />} Mostrar
                </Button>
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
