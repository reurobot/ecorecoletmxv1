"use client"; // Required for client-side rendering in Next.js

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, QrCode } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FormularioRecoleccion from "./FormularioRecoleccion";

export default function QRCodeScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Solo limpiar el escáner al desmontar
  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
      scannerRef.current?.clear();
    };
  }, []);

  const startScanner = async () => {
    setError(null);
    setScanResult(null);
    setIsScanning(true);
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("reader");
    }
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        await scannerRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            try {
              const jsonData = JSON.parse(decodedText);
              setScanResult(jsonData);
              setIsScanning(false);
              scannerRef.current?.stop();
            } catch (e) {
              setError("Invalid JSON in QR code");
            }
          },
          (errorMessage) => {
            console.warn(`Scan error: ${errorMessage}`);
          }
        );
      } else {
        setError("No cameras found");
        setIsScanning(false);
      }
    } catch (err) {
      setError("Failed to start scanner");
      setIsScanning(false);
    }
  };

  const handleRestart = () => {
    setScanResult(null);
    setError(null);
    setIsScanning(false);
    // Limpiar el div del reader para evitar overlays
    document.getElementById("reader")?.replaceChildren();
  };

  const contenedores = [
    { id: "0001", capacidad: "10 kg", costo: 10 },
    { id: "0002", capacidad: "20 kg", costo: 20 },
  ];

  const choferActual = {
    id: "CH001",
    numeroControl: "CH001",
    nombre: "Juan Pérez",
    camion: "CAM001",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <Button variant="ghost" size="icon" className="text-white">
                  <ArrowLeft />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Escaneo de Código QR</h1>
            </div>
            <div className="text-sm">Chofer: {choferActual.nombre}</div>
          </div>
        </div>
      </header>
      <div className="container mx-auto p-4">
        {scanResult ? (
          <FormularioRecoleccion qrData={scanResult} onVolver={handleRestart} />
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Escanear Código QR</CardTitle>
                <CardDescription>
                  Apunte la cámara al código QR del cliente
                </CardDescription>
              </CardHeader>
              <div
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  minHeight: 250,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {!isScanning && (
                  <span
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f3f4f6",
                      zIndex: 1,
                    }}
                  >
                    <QrCode size={120} color="#9ca3af" />
                  </span>
                )}
                <div
                  id="reader"
                  style={{
                    width: "100%",
                    maxWidth: "500px",
                    minHeight: 250,
                    zIndex: 2,
                  }}
                ></div>
              </div>
            </Card>
            {!isScanning && !scanResult && (
              <>
                <button
                  onClick={startScanner}
                  style={{
                    background: "#16A34A",
                    color: "white",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "0.5rem",
                    fontWeight: 600,
                    fontSize: "1rem",
                    border: "none",
                    cursor: "pointer",
                    margin: "1rem auto 0 auto",
                    display: "block",
                  }}
                >
                  Iniciar escaneo
                </button>
              </>
            )}
            {error && <p style={{ color: "red" }}>{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
