"use client";

import { useEffect, useState } from "react";
import { Check, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Cliente {
  _id: string;
  nombrePropietario: string;
  nombreNegocio: string;
  direccion: string;
  telefono: string;
  contenedores: string;
}

interface FormularioRecoleccionProps {
  qrData: { _id: string };
  onVolver: () => void;
}

export default function FormularioRecoleccion({
  qrData,
  onVolver,
}: FormularioRecoleccionProps) {
  const { toast } = useToast();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    contenedoresRecolectados: "1",
    pago: "si",
    formaPago: "efectivo",
    cantidadCobrada: "",
  });
  const [ticketData, setTicketData] = useState({
    folio: "",
    fecha: "",
    chofer: "",
    negocio: "",
    cantidadCobrada: 0,
    contenedoresRecolectados: 0,
    formaPago: "",
  });

  const contenedores = [
    { id: "0001", capacidad: "10 kg", costo: 150 },
    { id: "0002", capacidad: "20 kg", costo: 250 },
  ];

  const choferActual = {
    id: "CH001",
    numeroControl: "CH001",
    nombre: "Juan Pérez",
    camion: "CAM001",
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmarRecoleccion = async () => {
    if (
      Number(formData.contenedoresRecolectados) > Number(cliente!.contenedores)
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `El cliente solo tiene ${
          cliente!.contenedores
        } contenedores asignados`,
      });
      return;
    }

    const costoUnitario = contenedores[0].costo;
    const cantidadCobradaCalculada =
      Number(formData.contenedoresRecolectados) * costoUnitario;

    const cantidadCobradaFinal =
      formData.pago === "si"
        ? formData.cantidadCobrada
          ? Number(formData.cantidadCobrada)
          : cantidadCobradaCalculada
        : 0;

    const fecha = new Date();
    const folio = `${Date.now().toString().substring(6)}`;
    setTicketData({
      folio,
      fecha: fecha.toLocaleDateString("es-MX"),
      chofer: choferActual.nombre,
      negocio: cliente!.nombreNegocio,
      cantidadCobrada: cantidadCobradaFinal,
      contenedoresRecolectados: Number(formData.contenedoresRecolectados),
      formaPago: formData.formaPago,
    });

    try {
      await fetch("/api/recolecciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          choferId: choferActual.id,
          choferNombre: choferActual.nombre,
          camionId: choferActual.camion,
          localId: cliente!._id,
          localNombre: cliente!.nombreNegocio,
          contenedores: Number(formData.contenedoresRecolectados),
          creadoPor: choferActual.id,
          pago: formData.pago === "si",
          formaPago: formData.formaPago,
          cantidadCobrada: cantidadCobradaFinal,
          status: "completado",
          fechaCreacion: new Date().toISOString(),
        }),
      });
      toast({
        title: "Recolección registrada",
        description: `Se han recolectado ${
          formData.contenedoresRecolectados
        } contenedores de ${cliente!.nombreNegocio}`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar la recolección en el sistema.",
      });
      return;
    }

    setShowTicketDialog(true);
  };

  const handleImprimirTicket = () => {
    const ticketContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Recibo ${ticketData.folio}</title>
          <style>
            @page { size: 58mm auto; margin: 0; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 10px; line-height: 1.2; width: 58mm; padding: 2mm; color: black; background: white; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .mb-1 { margin-bottom: 1mm; }
            .mb-2 { margin-bottom: 2mm; }
            .mb-3 { margin-bottom: 3mm; }
            .border-dashed { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 1mm 0; margin: 2mm 0; }
            .separator { border-top: 1px dashed #000; margin: 2mm 0; }
          </style>
        </head>
        <body>
          <div class="center mb-3">
            <div class="bold">Municipio de Río Bravo, Tamaulipas</div>
            <div class="border-dashed">
              <div class="bold">RECIBO DE DINERO</div>
            </div>
          </div>
          <div class="mb-3">
            <div class="mb-1">Fecha: ${ticketData.fecha}</div>
            <div class="mb-1">Número de recibo: ${ticketData.folio}</div>
            <div class="mb-1">Recibí de: ${cliente!.nombrePropietario}</div>
            <div class="mb-1">Cantidad: $${ticketData.cantidadCobrada.toFixed(2)} MXN</div>
            <div class="mb-1">Concepto: Recolección de ${ticketData.contenedoresRecolectados} contenedores</div>
          </div>
          <div class="separator"></div>
          <div class="mb-2">
            <div class="mb-1">Firma del receptor: ___________</div>
            <div>Nombre del receptor: ${ticketData.chofer}</div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=220,height=600");
    if (printWindow) {
      printWindow.document.write(ticketContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    }

    toast({
      title: "Enviando a impresora",
      description: `Folio: ${ticketData.folio}`,
    });

    setTimeout(() => {
      setShowTicketDialog(false);
      onVolver();
    }, 1500);
  };

  useEffect(() => {
    const fetchLocal = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/locales");
        const data = await res.json();
        const locales = data.locales || [];
        const found = locales.find((l: any) => l._id === qrData._id);
        if (found) {
          setCliente(found);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se encontró información del local para este QR.",
          });
        }
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo obtener la información del local.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchLocal();
  }, [qrData._id, toast]);

  if (loading) {
    return (
      <div className="p-8 text-center">Cargando información del cliente...</div>
    );
  }

  if (!cliente) {
    return (
      <div className="p-8 text-center text-red-500">
        No se encontró información del cliente.
        <br />
        <span className="block mt-2 text-xs text-gray-700 bg-gray-100 p-2 rounded break-all">
          QR leído:
          <br />
          <pre className="whitespace-pre-wrap text-left">
            {JSON.stringify(qrData, null, 2)}
          </pre>
        </span>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
          <CardDescription>
            Confirme los datos y registre la recolección
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-bold text-lg">{cliente.nombreNegocio}</h3>
            <p className="text-sm text-gray-600">{cliente.direccion}</p>
            <p className="text-sm text-gray-600">
              Propietario: {cliente.nombrePropietario}
            </p>
            <p className="text-sm text-gray-600">
              Teléfono: {cliente.telefono}
            </p>
            <p className="text-sm text-gray-600">
              Contenedores asignados: {cliente.contenedores}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contenedoresRecolectados">
                Contenedores Recolectados
              </Label>
              <Select
                value={formData.contenedoresRecolectados}
                onValueChange={(value) =>
                  handleSelectChange("contenedoresRecolectados", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione cantidad" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: Number(cliente.contenedores) },
                    (_, i) => i + 1
                  ).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "contenedor" : "contenedores"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pago">¿Realizó el pago?</Label>
              <Select
                value={formData.pago}
                onValueChange={(value) => handleSelectChange("pago", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="si">Sí</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.pago === "si" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="formaPago">Forma de Pago</Label>
                  <Select
                    value={formData.formaPago}
                    onValueChange={(value) =>
                      handleSelectChange("formaPago", value)
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
                  <Label htmlFor="cantidadCobrada">
                    Cantidad Cobrada (MXN)
                  </Label>
                  <Input
                    id="cantidadCobrada"
                    type="number"
                    placeholder={`Sugerido: ${
                      Number(formData.contenedoresRecolectados) *
                      contenedores[0].costo
                    } MXN`}
                    value={formData.cantidadCobrada}
                    onChange={(e) =>
                      handleInputChange("cantidadCobrada", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
              </>
            )}
            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={onVolver} className="flex-1">
                Volver
              </Button>
              <Button
                onClick={handleConfirmarRecoleccion}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                Confirmar Recolección
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Recibo de Dinero</DialogTitle>
            <DialogDescription>
              Recibo generado para la recolección
            </DialogDescription>
          </DialogHeader>

          <div
            className="bg-white p-4 text-xs font-mono leading-tight"
            style={{ width: "58mm" }}
          >
            <div className="text-center mb-3">
              <div className="font-bold">
                Municipio de Río Bravo, Tamaulipas
              </div>
              <div className="border-t border-b border-dashed py-1 my-2">
                <div className="font-bold">RECIBO DE DINERO</div>
              </div>
            </div>

            <div className="space-y-1 mb-3">
              <div>Fecha: {ticketData.fecha}</div>
              <div>Número de recibo: {ticketData.folio}</div>
              <div>Recibí de: {cliente.nombrePropietario}</div>
              <div>Cantidad: ${ticketData.cantidadCobrada.toFixed(2)} MXN</div>
              <div>
                Concepto: Recolección de {ticketData.contenedoresRecolectados}{" "}
                contenedores
              </div>
            </div>

            <div className="border-t border-dashed my-3"></div>

            <div className="space-y-2">
              <div>Firma del receptor: ___________</div>
              <div>Nombre del receptor: {ticketData.chofer}</div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTicketDialog(false)}
            >
              Cerrar
            </Button>
            <Button
              onClick={handleImprimirTicket}
              className="bg-green-600 hover:bg-green-700"
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Recibo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
