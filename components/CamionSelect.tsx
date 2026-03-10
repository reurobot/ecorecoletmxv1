import { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface CamionOption {
  _id: string;
  placa: string;
  marca?: string;
}

interface CamionSelectProps {
  value: string;
  onChange: (camion: CamionOption) => void;
}

export default function CamionSelect({ value, onChange }: CamionSelectProps) {
  const [camiones, setCamiones] = useState<CamionOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/camiones")
      .then((res) => res.json())
      .then((data) => {
        setCamiones(Array.isArray(data.camiones) ? data.camiones : []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Select
      value={value}
      onValueChange={(id) => {
        const found = camiones.find((c) => c._id === id);
        if (found) onChange(found);
      }}
      disabled={loading}
    >
      <SelectTrigger>
        <SelectValue placeholder={loading ? "Cargando camiones..." : "Selecciona un camión"} />
      </SelectTrigger>
      <SelectContent>
        {camiones.map((c) => (
          <SelectItem key={c._id} value={c._id}>
            {c.placa} {c.marca ? `- ${c.marca}` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
