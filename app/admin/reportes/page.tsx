"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileDown, Search } from "lucide-react";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ChoferSelect from "@/components/ChoferSelect";
import CamionSelect from "@/components/CamionSelect";
import LocalSelect from "@/components/LocalSelect";

interface ChoferOption {
  _id: string;
  nombre: string;
}
interface CamionOption {
  _id: string;
  placa: string;
}
interface LocalOption {
  _id: string;
  nombreNegocio: string;
}
interface RecoleccionResult {
  _id: string;
  fechaAsignacion: string;
  localNombre: string;
  choferNombre: string;
  camionId: string;
  cantidadCobrada: number;
  pago: boolean;
  status: string;
}

export default function Reportes() {
  const { toast } = useToast();
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [reporteGenerado, setReporteGenerado] = useState(false);
  const [chofer, setChofer] = useState<ChoferOption | null>(null);
  const [camion, setCamion] = useState<CamionOption | null>(null);
  const [local, setLocal] = useState<LocalOption | null>(null);
  const [estado, setEstado] = useState("");
  const [resultados, setResultados] = useState<RecoleccionResult[]>([]);

  const handleGenerarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debe seleccionar ambas fechas",
      });
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La fecha de inicio no puede ser posterior a la fecha de fin",
      });
      return;
    }

    setReporteGenerado(false);
    setResultados([]);

    try {
      const res = await fetch("/api/recolecciones");
      const data = await res.json();
      
      let filtered = Array.isArray(data) ? data : [];
      
      // Filtrar por fechas
      filtered = filtered.filter((r: RecoleccionResult) => {
        const fecha = new Date(r.fechaAsignacion);
        return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin);
      });

      // Filtrar por chofer
      if (chofer?._id) {
        filtered = filtered.filter((r: RecoleccionResult) => r.choferId === chofer._id);
      }

      // Filtrar por camion
      if (camion?._id) {
        filtered = filtered.filter((r: RecoleccionResult) => r.camionId === camion._id);
      }

      // Filtrar por local
      if (local?._id) {
        filtered = filtered.filter((r: RecoleccionResult) => r.localId === local._id);
      }

      // Filtrar por estado
      if (estado) {
        filtered = filtered.filter((r: RecoleccionResult) => r.status === estado);
      }

      setResultados(filtered);
      setReporteGenerado(true);

      toast({
        title: "Reporte generado",
        description: `Reporte de clientes visitados del ${fechaInicio} al ${fechaFin}`,
      });
    } catch (err) {
      console.error("Error generando reporte:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo generar el reporte",
      });
    }
  };

  const handleExportarExcel = () => {
    if (resultados.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No hay datos para exportar",
      });
      return;
    }

    const dataToExport = resultados.map((row) => ({
      Fecha: row.fechaAsignacion
        ? new Date(row.fechaAsignacion).toLocaleDateString()
        : "",
      Cliente: row.localNombre || "",
      Monto: row.cantidadCobrada || 0,
      Chofer: row.choferNombre || "",
      Camion: row.camionId || "",
      Pago: row.pago ? "Sí" : "No",
      Estado: row.status || "",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clientes Visitados");
    XLSX.writeFile(wb, `clientes_visitados_${fechaInicio}_a_${fechaFin}.xlsx`);

    toast({
      title: "Reporte exportado",
      description: "El archivo Excel se ha generado correctamente.",
    });
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
            <h1 className="text-xl font-bold">Reportes</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Reporte de Clientes Visitados</CardTitle>
            <CardDescription>
              Genere un reporte de los clientes visitados en un rango de fechas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaFin">Fecha Fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Chofer (Opcional)</Label>
                  <ChoferSelect value={chofer?._id || ""} onChange={setChofer} />
                </div>
                <div className="space-y-2">
                  <Label>Camión (Opcional)</Label>
                  <CamionSelect value={camion?._id || ""} onChange={setCamion} />
                </div>
                <div className="space-y-2">
                  <Label>Local (Opcional)</Label>
                  <LocalSelect value={local?._id || ""} onChange={setLocal} />
                </div>
                <div className="space-y-2">
                  <Label>Estado (Opcional)</Label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleGenerarReporte}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Search className="mr-2 h-4 w-4" />
                Generar Reporte
              </Button>

              {reporteGenerado && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Resultados ({resultados.length} registros)
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportarExcel}
                      disabled={resultados.length === 0}
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Exportar Excel
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 text-left py-3 px-4 font-semibold">
                            Fecha
                          </th>
                          <th className="border border-gray-300 text-left py-3 px-4 font-semibold">
                            Cliente
                          </th>
                          <th className="border border-gray-300 text-left py-3 px-4 font-semibold">
                            Monto
                          </th>
                          <th className="border border-gray-300 text-left py-3 px-4 font-semibold">
                            Chofer
                          </th>
                          <th className="border border-gray-300 text-left py-3 px-4 font-semibold">
                            Camión
                          </th>
                          <th className="border border-gray-300 text-left py-3 px-4 font-semibold">
                            Pago
                          </th>
                          <th className="border border-gray-300 text-left py-3 px-4 font-semibold">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultados.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="border border-gray-300 text-center py-8 text-gray-500"
                            >
                              No se encontraron registros para el período
                              seleccionado
                            </td>
                          </tr>
                        ) : (
                          resultados.map((visita) => (
                            <tr key={visita._id} className="hover:bg-gray-50">
                              <td className="border border-gray-300 py-3 px-4">
                                {visita.fechaAsignacion
                                  ? new Date(
                                      visita.fechaAsignacion
                                    ).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td className="border border-gray-300 py-3 px-4">
                                {visita.localNombre || "-"}
                              </td>
                              <td className="border border-gray-300 py-3 px-4">
                                ${(visita.cantidadCobrada || 0).toFixed(2)} MXN
                              </td>
                              <td className="border border-gray-300 py-3 px-4">
                                {visita.choferNombre || "-"}
                              </td>
                              <td className="border border-gray-300 py-3 px-4">
                                {visita.camionId || "-"}
                              </td>
                              <td className="border border-gray-300 py-3 px-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    visita.pago
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {visita.pago ? "Sí" : "No"}
                                </span>
                              </td>
                              <td className="border border-gray-300 py-3 px-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    visita.status === "completado"
                                      ? "bg-green-100 text-green-800"
                                      : visita.status === "cancelado"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {visita.status === "completado"
                                    ? "Completado"
                                    : visita.status === "cancelado"
                                    ? "Cancelado"
                                    : visita.status || "Sin estado"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {resultados.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                      <h4 className="font-semibold mb-2">Resumen:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Total registros:</span>{" "}
                          {resultados.length}
                        </div>
                        <div>
                          <span className="font-medium">Con pago:</span>{" "}
                          {resultados.filter((r) => r.pago).length}
                        </div>
                        <div>
                          <span className="font-medium">Monto total:</span> $
                          {resultados
                            .reduce(
                              (sum, r) => sum + (r.cantidadCobrada || 0),
                              0
                            )
                            .toFixed(2)}{" "}
                          MXN
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
