"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ExportarDatos() {
  const { toast } = useToast()
  const [tipoDatos, setTipoDatos] = useState("visitas")
  const [formato, setFormato] = useState("excel")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")

  const handleExportar = () => {
    // Validar fechas
    if (!fechaInicio || !fechaFin) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debe seleccionar ambas fechas",
      })
      return
    }

    // Validar que la fecha de inicio no sea posterior a la fecha de fin
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La fecha de inicio no puede ser posterior a la fecha de fin",
      })
      return
    }

    // Generar nombre de archivo
    const nombreArchivo = `${tipoDatos}_${fechaInicio}_${fechaFin}.${formato}`

    toast({
      title: "Exportando datos",
      description: `Se está generando el archivo ${nombreArchivo}`,
    })

    // En producción, aquí se generaría y descargaría el archivo
    setTimeout(() => {
      toast({
        title: "Exportación completada",
        description: `El archivo ${nombreArchivo} se ha descargado correctamente`,
      })
    }, 1500)
  }

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
            <h1 className="text-xl font-bold">Exportar Datos</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Exportar Información</CardTitle>
            <CardDescription>Descargue la información del sistema en diferentes formatos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tipoDatos">Tipo de Datos</Label>
              <Select value={tipoDatos} onValueChange={setTipoDatos}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo de datos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visitas">Visitas (Recolecciones)</SelectItem>
                  <SelectItem value="pagos">Pagos</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                  <SelectItem value="choferes">Choferes</SelectItem>
                  <SelectItem value="contenedores">Contenedores</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="formato">Formato de Exportación</Label>
              <Select value={formato} onValueChange={setFormato}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rango de Fechas</Label>
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
                  <Input id="fechaFin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                *Solo aplica para visitas y pagos. Para otros tipos de datos, se exportará toda la información.
              </p>
            </div>

            <Button onClick={handleExportar} className="w-full bg-green-600 hover:bg-green-700">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar Datos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
