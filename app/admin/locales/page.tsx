"use client";
import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function TablaLocales() {
  const [locales, setLocales] = useState<any[]>([]);
  const [qrDialog, setQrDialog] = useState<{
    open: boolean;
    qrUrl: string | null;
  }>({ open: false, qrUrl: null });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchLocales() {
      setLoading(true);
      try {
        if (!user) return;
        const res = await fetch("/api/locales");
        const data = await res.json();
        setLocales(Array.isArray(data.locales) ? data.locales : []);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error?.message || "No se pudo obtener la lista de locales",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchLocales();
  }, [user]);

  const handleShowQR = (qrUrl: string) => {
    setQrDialog({ open: true, qrUrl });
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/locales/${id}`, { method: "DELETE" });
      toast({
        title: "Local eliminado",
        description: "El local y su QR han sido eliminados correctamente",
      });
      const res = await fetch("/api/locales");
      const data = await res.json();
      setLocales(Array.isArray(data.locales) ? data.locales : []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "No se pudo eliminar el local",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Locales Registrados</CardTitle>
        <CardDescription>
          Información de todos los locales y su QR asignado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Cargando locales...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Nombre</th>
                  <th className="text-left py-3 px-4">Dirección</th>
                  <th className="text-left py-3 px-4">Propietario</th>
                  <th className="text-left py-3 px-4">QR</th>
                  <th className="text-left py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {locales.map((local: any, idx: number) => (
                  <tr key={local._id || idx} className="border-b">
                    <td className="py-3 px-4">{local.nombreNegocio}</td>
                    <td className="py-3 px-4">{local.direccion}</td>
                    <td className="py-3 px-4">{local.nombrePropietario}</td>
                    <td className="py-3 px-4">
                      {local.qrUrl ? (
                        <div
                          className="w-16 h-16 cursor-pointer relative"
                          onClick={() => handleShowQR(local.qrUrl)}
                        >
                          <Image
                            src={local.qrUrl}
                            alt={`QR de ${local.nombreNegocio}`}
                            width={64}
                            height={64}
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Sin QR</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {local.qrUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowQR(local.qrUrl)}
                          >
                            Ver QR
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(local._id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Dialog
          open={qrDialog.open}
          onOpenChange={(open) => setQrDialog({ ...qrDialog, open })}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>QR del Local</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-4">
              {qrDialog.qrUrl && (
                <Image
                  src={qrDialog.qrUrl}
                  alt="QR del local"
                  width={256}
                  height={256}
                  className="object-contain"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
