"use client";
import { useState } from "react";
import QRCode from "react-qr-code";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";

export default function GeneratorQR() {
  const [form, setForm] = useState({
    id: "",
    nombreNegocio: "",
    nombrePropietario: "",
    direccion: "",
    telefono: "",
    contenedores: "",
  });

  const [qrValue, setQrValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/locales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreNegocio: form.nombreNegocio,
          nombrePropietario: form.nombrePropietario,
          direccion: form.direccion,
          telefono: form.telefono,
          contenedores: form.contenedores,
        }),
      });
      
      if (!res.ok) {
        throw new Error("Error al crear el local");
      }
      
      const data = await res.json();
      const local = data.local;
      
      setQrValue(JSON.stringify(local));
      
      setTimeout(async () => {
        const qrElement = document.getElementById("qr-preview");
        if (qrElement) {
          const canvas = await html2canvas(qrElement);
          const pngDataUrl = canvas.toDataURL("image/png");
          
          const uploadRes = await fetch("/api/upload-qr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              localId: local._id,
              pngBase64: pngDataUrl,
            }),
          });
          
          const uploadData = await uploadRes.json();
          const qrUrl = uploadData.url;
          
          await fetch(`/api/locales/${local._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qrUrl }),
          });
          
          setQrValue(JSON.stringify({ ...local, qrUrl }));
        }
        setLoading(false);
      }, 500);
    } catch (err: any) {
      setError(err?.message || "Error al crear el local");
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Generar QR para Local</CardTitle>
        <CardDescription>
          Llena el formulario para generar un código QR para un local.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="nombreNegocio">Nombre del local</Label>
            <Input
              id="nombreNegocio"
              name="nombreNegocio"
              value={form.nombreNegocio}
              onChange={handleChange}
              placeholder="Ej. Tienda Don Pepe"
              required
            />
          </div>
          <div>
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Ej. Calle 123, Colonia Centro"
              required
            />
          </div>
          <div>
            <Label htmlFor="nombrePropietario">Propietario del local</Label>
            <Input
              id="nombrePropietario"
              name="nombrePropietario"
              value={form.nombrePropietario}
              onChange={handleChange}
              placeholder="Ej. Juan Pérez"
              required
            />
          </div>
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Ej. 555-123-4567"
              required
            />
          </div>
          <div>
            <Label htmlFor="contenedores">Contenedores asignados</Label>
            <Input
              id="contenedores"
              name="contenedores"
              value={form.contenedores}
              onChange={handleChange}
              placeholder="Ej. 2"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? "Generando..." : "Generar QR"}
          </Button>
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
        </form>
        {qrValue && (
          <div className="flex flex-col items-center mt-6">
            <div id="qr-preview" className="bg-white p-4 rounded">
              <QRCode value={qrValue} />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Escanea para ver los datos
            </p>
            <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(JSON.parse(qrValue), null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
