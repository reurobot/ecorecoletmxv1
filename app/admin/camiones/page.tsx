"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Save, Trash2, Plus, ArrowLeft } from "lucide-react";

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

const estadoOptions = [
  "activo",
  "fuera de servicio",
  "en mantenimiento",
  "retirado",
];

export default function TablaCamiones() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{
    id?: string;
    placa: string;
    marca: string;
    costo: string;
    capacidad: string;
    estado: string;
  }>({
    placa: "",
    marca: "",
    costo: "",
    capacidad: "",
    estado: "activo",
  });
  const [filtro, setFiltro] = useState("");
  const [camiones, setCamiones] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCamiones() {
      try {
        const res = await fetch("/api/camiones");
        const data = await res.json();
        setCamiones(Array.isArray(data.camiones) ? data.camiones : []);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error?.message || "No se pudo obtener la lista de camiones",
        });
      }
    }
    fetchCamiones();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.placa ||
      !formData.marca ||
      !formData.costo ||
      !formData.capacidad ||
      !formData.estado
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Todos los campos son obligatorios",
      });
      return;
    }
    if (isNaN(Number(formData.costo)) || Number(formData.costo) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El costo debe ser un número positivo",
      });
      return;
    }
    try {
      if (isEditing) {
        await fetch(`/api/camiones/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            placa: formData.placa,
            marca: formData.marca,
            costo: formData.costo,
            capacidad: formData.capacidad,
            estado: formData.estado,
          }),
        });
        toast({
          title: "Camión actualizado",
          description: `El camión ha sido actualizado correctamente`,
        });
      } else {
        await fetch("/api/camiones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            placa: formData.placa,
            marca: formData.marca,
            costo: formData.costo,
            capacidad: formData.capacidad,
            estado: formData.estado,
          }),
        });
        toast({
          title: "Camión registrado",
          description: `El camión ha sido registrado correctamente`,
        });
      }
      const res = await fetch("/api/camiones");
      const data = await res.json();
      setCamiones(Array.isArray(data.camiones) ? data.camiones : []);
      setShowDialog(false);
      resetForm();
      setIsEditing(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "No se pudo guardar el camión",
      });
    }
  };

  const handleEdit = (camion: any) => {
    setFormData({
      placa: camion.placa,
      marca: camion.marca,
      costo: camion.costo,
      capacidad: camion.capacidad,
      estado: camion.estado,
      id: camion._id,
    });
    setIsEditing(true);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/camiones/${id}`, { method: "DELETE" });
      toast({
        title: "Camión eliminado",
        description: "El camión ha sido eliminado correctamente",
      });
      const res = await fetch("/api/camiones");
      const data = await res.json();
      setCamiones(Array.isArray(data.camiones) ? data.camiones : []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "No se pudo eliminar el camión",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      placa: "",
      marca: "",
      costo: "",
      capacidad: "",
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
            <h1 className="text-xl font-bold">Configuración de Camiones</h1>
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
            Nuevo Camión
          </Button>
          <div className="flex items-center gap-2">
            <Label htmlFor="filtroCamion" className="mb-0">
              Filtrar:
            </Label>
            <Input
              id="filtroCamion"
              type="text"
              placeholder="Buscar por placa, marca..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Configuración de Camiones</CardTitle>
              <CardDescription>
                Configure los camiones y sus datos principales
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">Placa</th>
                    <th className="text-left py-3 px-4">Marca</th>
                    <th className="text-left py-3 px-4">Capacidad</th>
                    <th className="text-left py-3 px-4">
                      Costo de Recolección
                    </th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-left py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {camiones
                    .filter(
                      (camion) =>
                        (camion._id || "")
                          .toLowerCase()
                          .includes(filtro.toLowerCase()) ||
                        (camion.placa || "")
                          .toLowerCase()
                          .includes(filtro.toLowerCase()) ||
                        (camion.marca || "")
                          .toLowerCase()
                          .includes(filtro.toLowerCase())
                    )
                    .map((camion) => (
                      <tr key={camion._id} className="border-b">
                        <td className="py-3 px-4">{camion._id}</td>
                        <td className="py-3 px-4">{camion.placa}</td>
                        <td className="py-3 px-4">{camion.marca}</td>
                        <td className="py-3 px-4">{camion.capacidad}</td>
                        <td className="py-3 px-4">{camion.costo} pesos</td>
                        <td className="py-3 px-4 capitalize">
                          {camion.estado}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(camion)}
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
                                    eliminará permanentemente el camión
                                    {camion._id}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => handleDelete(camion._id)}
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
              {isEditing ? "Editar Camión" : "Nuevo Camión"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Actualice la información del camión"
                : "Complete el formulario para registrar un nuevo camión"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="placa">Placa</Label>
              <Input
                id="placa"
                name="placa"
                value={formData.placa}
                onChange={handleChange}
                required
                placeholder="Ej: ABC123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                required
                placeholder="Ej: Volvo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacidad">Capacidad</Label>
              <Input
                id="capacidad"
                name="capacidad"
                value={formData.capacidad}
                onChange={handleChange}
                required
                placeholder="Ej: 10 toneladas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costo">Costo de Recolección (pesos)</Label>
              <Input
                id="costo"
                name="costo"
                type="number"
                value={formData.costo}
                onChange={handleChange}
                required
                min="1"
                step="1"
                placeholder="Ej: 1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="mantenimiento">Mantenimiento</option>
              </select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Actualizar" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
