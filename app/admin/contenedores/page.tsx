"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Plus } from "lucide-react";

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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const tipoResiduoOptions = [
  "General/Mixto",
  "Orgánico",
  "Inorgánico",
  "Reciclaje",
  "Plástico",
  "Papel/Cartón",
  "Vidrio",
  "Metal",
  "Electrónicos",
  "Peligroso",
];
const estadoOptions = [
  "activo",
  "fuera de servicio",
  "en reparación",
  "retirado",
];

export default function TablaContenedores() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{
    id?: string;
    peso: string;
    tipoResiduo: string;
    ubicacion: string;
    estado: string;
  }>({
    peso: "",
    tipoResiduo: "General/Mixto",
    ubicacion: "",
    estado: "activo",
  });
  const [filtro, setFiltro] = useState("");

  const [contenedores, setContenedores] = useState<any[]>([]);

  useEffect(() => {
    async function fetchContenedores() {
      try {
        const res = await fetch("/api/contenedores");
        const data = await res.json();
        setContenedores(Array.isArray(data) ? data : []);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error?.message || "No se pudo obtener la lista de contenedores",
        });
      }
    }
    fetchContenedores();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.peso ||
      !formData.tipoResiduo ||
      !formData.ubicacion ||
      !formData.estado
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Todos los campos son obligatorios",
      });
      return;
    }
    const pesoFormateado = `${formData.peso} lbs`;
    try {
      if (isEditing) {
        await fetch(`/api/contenedores/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            peso: pesoFormateado,
            tipoResiduo: formData.tipoResiduo,
            ubicacion: formData.ubicacion,
            estado: formData.estado,
          }),
        });
        toast({
          title: "Contenedor actualizado",
          description: "El contenedor ha sido actualizado correctamente",
        });
      } else {
        await fetch("/api/contenedores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            peso: pesoFormateado,
            tipoResiduo: formData.tipoResiduo,
            ubicacion: formData.ubicacion,
            estado: formData.estado,
          }),
        });
        toast({
          title: "Contenedor agregado",
          description: "El contenedor ha sido agregado correctamente",
        });
      }
      const res = await fetch("/api/contenedores");
      const data = await res.json();
      setContenedores(Array.isArray(data) ? data : []);
      setShowDialog(false);
      resetForm();
      setIsEditing(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "No se pudo guardar el contenedor",
      });
    }
  };

  const handleEdit = (contenedor: any) => {
    setFormData({
      id: contenedor._id,
      peso: contenedor.peso?.replace(/\s*lbs$/, "") || "",
      tipoResiduo: contenedor.tipoResiduo,
      ubicacion: contenedor.ubicacion,
      estado: contenedor.estado,
    });
    setIsEditing(true);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/contenedores/${id}`, { method: "DELETE" });
      toast({
        title: "Contenedor eliminado",
        description: "El contenedor ha sido eliminado correctamente",
      });
      const res = await fetch("/api/contenedores");
      const data = await res.json();
      setContenedores(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "No se pudo eliminar el contenedor",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      peso: "",
      tipoResiduo: "General/Mixto",
      ubicacion: "",
      estado: "activo",
    });
    setIsEditing(false);
  };

  const handleAddNew = () => {
    resetForm();
    setIsEditing(false);
    setShowDialog(true);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center">
            <Link href="/admin" className="mr-4">
              <Button variant="ghost" size="icon" className="text-white">
                <ArrowLeft />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Configuración de Contenedores</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row md:justify-between mb-4 gap-2">
          <Button
            onClick={handleAddNew}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Contenedor
          </Button>
          <div className="flex items-center gap-2">
            <Label htmlFor="filtroContenedor" className="mb-0">
              Filtrar:
            </Label>
            <Input
              id="filtroContenedor"
              type="text"
              placeholder="Buscar por ID o capacidad..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Configuración de Contenedores</CardTitle>
              <CardDescription>
                Administre los contenedores del sistema
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">Peso</th>
                    <th className="text-left py-3 px-4">Tipo de Residuo</th>
                    <th className="text-left py-3 px-4">Ubicación</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-left py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {contenedores
                    .filter(
                      (contenedor) =>
                        (contenedor._id || "")
                          .toLowerCase()
                          .includes(filtro.toLowerCase()) ||
                        (contenedor.peso || "")
                          .toLowerCase()
                          .includes(filtro.toLowerCase())
                    )
                    .map((contenedor) => (
                      <tr key={contenedor._id} className="border-b">
                        <td className="py-3 px-4">{contenedor._id}</td>
                        <td className="py-3 px-4">{contenedor.peso}</td>
                        <td className="py-3 px-4">{contenedor.tipoResiduo}</td>
                        <td className="py-3 px-4">{contenedor.ubicacion}</td>
                        <td className="py-3 px-4">{contenedor.estado}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(contenedor)}
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
                                    eliminará permanentemente el contenedor
                                    {contenedor._id}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => handleDelete(contenedor._id)}
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Contenedor" : "Nuevo Contenedor"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Actualice la información del contenedor"
                : "Complete el formulario para registrar un nuevo contenedor"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="peso">Peso (libras)</Label>
              <Input
                type="number"
                id="peso"
                name="peso"
                value={formData.peso}
                onChange={handleChange}
                min={1}
                required
              />
            </div>
            <div>
              <Label htmlFor="tipoResiduo">Tipo de Residuo</Label>
              <Select
                value={formData.tipoResiduo}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, tipoResiduo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un tipo de residuo" />
                </SelectTrigger>
                <SelectContent>
                  {tipoResiduoOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input
                type="text"
                id="ubicacion"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, estado: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadoOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              {isEditing ? "Actualizar Contenedor" : "Agregar Contenedor"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
