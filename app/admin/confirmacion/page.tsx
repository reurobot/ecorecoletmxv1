"use client";
import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ChoferSelect from "@/components/ChoferSelect";
import LocalSelect from "@/components/LocalSelect";
import CamionSelect from "@/components/CamionSelect";

interface Recoleccion {
  _id: string;
  choferId: string;
  choferNombre: string;
  camionId: string;
  localId: string;
  localNombre: string;
  contenedores: number;
  pago: boolean;
  formaPago?: string;
  cantidadCobrada?: number;
  status: "pendiente" | "en_proceso" | "completado";
  creadoPor: string;
  fechaAsignacion?: string;
}

export default function ConfirmacionRecolecciones() {
  const [filtroChofer, setFiltroChofer] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [showRecolectModal, setShowRecolectModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [recoleccionAEliminar, setRecoleccionAEliminar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recolecciones, setRecolecciones] = useState<Recoleccion[]>([]);
  const [camiones, setCamiones] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const [recolectForm, setRecolectForm] = useState({
    choferId: "",
    choferNombre: "",
    camionId: "",
    localId: "",
    localNombre: "",
    contenedores: 1,
    pago: false,
    formaPago: "",
    cantidadCobrada: 0,
  });

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    fetch("/api/recolecciones")
      .then((res) => res.json())
      .then((data) => {
        setRecolecciones(Array.isArray(data) ? data : []);
      })
      .catch((err: any) => {
        setError(err?.message || "No se pudo obtener la lista de recolecciones");
        toast({
          variant: "destructive",
          title: "Error",
          description: err?.message || "No se pudo obtener la lista de recolecciones",
        });
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    fetch("/api/camiones")
      .then((res) => res.json())
      .then((data) => {
        setCamiones(Array.isArray(data.camiones) ? data.camiones : []);
      });
  }, []);

  const handleRecolectFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setRecolectForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "contenedores" || name === "cantidadCobrada"
          ? Number(value)
          : value,
    }));
  };

  const handleChoferChange = (chofer: { _id: string; nombre: string }) => {
    setRecolectForm((prev) => ({
      ...prev,
      choferId: chofer._id,
      choferNombre: chofer.nombre,
    }));
  };

  const handleLocalChange = (local: { _id: string; nombreNegocio: string }) => {
    setRecolectForm((prev) => ({
      ...prev,
      localId: local._id,
      localNombre: local.nombreNegocio,
    }));
  };

  const handleCamionChange = (camion: { _id: string; placa: string }) => {
    setRecolectForm((prev) => ({
      ...prev,
      camionId: camion._id,
    }));
  };

  const handleRecolectFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !recolectForm.choferId ||
      !recolectForm.choferNombre ||
      !recolectForm.camionId ||
      !recolectForm.localId ||
      !recolectForm.localNombre ||
      !recolectForm.contenedores
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Todos los campos son obligatorios",
      });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/recolecciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...recolectForm,
          creadoPor: user?.uid || "admin",
          status: "completado",
          fechaCreacion: new Date().toISOString(),
        }),
      });
      toast({
        title: "Recolección agregada",
        description: `Se agregó la recolección de ${recolectForm.choferNombre}`,
      });
      setShowRecolectModal(false);
      setRecolectForm({
        choferId: "",
        choferNombre: "",
        camionId: "",
        localId: "",
        localNombre: "",
        contenedores: 1,
        pago: false,
        formaPago: "",
        cantidadCobrada: 0,
      });
      const res = await fetch("/api/recolecciones");
      const data = await res.json();
      setRecolecciones(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "No se pudo crear la recolección");
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.message || "No se pudo crear la recolección",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarRecoleccion = async () => {
    if (!recoleccionAEliminar) return;

    try {
      await fetch(`/api/recolecciones/${recoleccionAEliminar}`, { method: "DELETE" });
      toast({
        title: "Recolección eliminada",
        description: "La recolección ha sido eliminada exitosamente",
      });
      const res = await fetch("/api/recolecciones");
      const data = await res.json();
      setRecolecciones(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la recolección",
      });
    } finally {
      setShowDeleteDialog(false);
      setRecoleccionAEliminar(null);
    }
  };

  const confirmarEliminacion = (id: string) => {
    setRecoleccionAEliminar(id);
    setShowDeleteDialog(true);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Confirmación de recolecciones</h2>
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="font-medium">Filtrar por chofer:</label>
          <input
            type="text"
            className="border rounded p-2"
            placeholder="Nombre del chofer"
            value={filtroChofer}
            onChange={(e) => setFiltroChofer(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-medium">Filtrar por fecha:</label>
          <input
            type="date"
            className="border rounded p-2"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
          />
        </div>
        <Button
          variant={"default"}
          className="ml-auto"
          onClick={() => setShowRecolectModal(true)}
        >
          Agregar
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Fecha</th>
              <th className="text-left py-3 px-4">Chofer</th>
              <th className="text-left py-3 px-4">Camión</th>
              <th className="text-left py-3 px-4">Local</th>
              <th className="text-left py-3 px-4">Contenedores</th>
              <th className="text-left py-3 px-4">Pago</th>
              <th className="text-left py-3 px-4">Forma de Pago</th>
              <th className="text-left py-3 px-4">Cantidad Cobrada</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="text-center py-6">
                  Cargando...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={10} className="text-center text-red-600 py-6">
                  {error}
                </td>
              </tr>
            ) : (
              recolecciones
                .filter((r: Recoleccion) => {
                  const matchChofer = r.choferNombre
                    .toLowerCase()
                    .includes(filtroChofer.toLowerCase());

                  let matchFecha = true;
                  if (filtroFecha && r.fechaAsignacion) {
                    const fechaRecoleccion = new Date(r.fechaAsignacion)
                      .toISOString()
                      .split("T")[0];
                    matchFecha = fechaRecoleccion === filtroFecha;
                  }

                  return matchChofer && matchFecha;
                })
                .map((r: Recoleccion) => {
                  const camion = camiones.find((c) => c._id === r.camionId);
                  return (
                    <tr key={r._id} className="border-b">
                      <td className="py-3 px-4">
                        {r.fechaAsignacion
                          ? new Date(r.fechaAsignacion).toLocaleDateString("es-MX")
                          : "-"}
                      </td>
                      <td className="py-3 px-4">{r.choferNombre}</td>
                      <td className="py-3 px-4">
                        {camion
                          ? `${camion.placa}${camion.marca ? ` - ${camion.marca}` : ""}`
                          : r.camionId}
                      </td>
                      <td className="py-3 px-4">{r.localNombre}</td>
                      <td className="py-3 px-4">{r.contenedores}</td>
                      <td className="py-3 px-4">{r.pago ? "Sí" : "No"}</td>
                      <td className="py-3 px-4">
                        {r.pago && r.formaPago
                          ? r.formaPago.charAt(0).toUpperCase() + r.formaPago.slice(1)
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        {r.pago && r.cantidadCobrada
                          ? `$${Number(r.cantidadCobrada).toFixed(2)} MXN`
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-white ${
                            r.status === "completado"
                              ? "bg-green-600"
                              : r.status === "en_proceso"
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                          }`}
                        >
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => confirmarEliminacion(r._id)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
      <Dialog open={showRecolectModal} onOpenChange={setShowRecolectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar recolección</DialogTitle>
            <DialogDescription>
              Complete el formulario para agregar una nueva recolección
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRecolectFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Chofer</Label>
              <ChoferSelect
                value={recolectForm.choferId}
                onChange={handleChoferChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Camión</Label>
              <CamionSelect
                value={recolectForm.camionId}
                onChange={handleCamionChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Local</Label>
              <LocalSelect
                value={recolectForm.localId}
                onChange={handleLocalChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contenedores">Contenedores recogidos</Label>
              <Input
                id="contenedores"
                name="contenedores"
                type="number"
                min={1}
                value={recolectForm.contenedores}
                onChange={handleRecolectFormChange}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pago"
                  name="pago"
                  checked={recolectForm.pago}
                  onCheckedChange={(checked) =>
                    setRecolectForm((prev) => ({ ...prev, pago: !!checked }))
                  }
                />
                <Label htmlFor="pago">¿Se realizó el pago?</Label>
              </div>
            </div>
            {recolectForm.pago && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="formaPago">Forma de pago</Label>
                  <Select
                    value={recolectForm.formaPago}
                    onValueChange={(value) =>
                      setRecolectForm((prev) => ({ ...prev, formaPago: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione forma de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cantidadCobrada">Cantidad cobrada (MXN)</Label>
                  <Input
                    id="cantidadCobrada"
                    name="cantidadCobrada"
                    type="number"
                    min={0}
                    step="0.01"
                    value={recolectForm.cantidadCobrada}
                    onChange={handleRecolectFormChange}
                    placeholder="0.00 MXN"
                  />
                </div>
              </>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRecolectModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar recolección</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta recolección? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleEliminarRecoleccion}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
