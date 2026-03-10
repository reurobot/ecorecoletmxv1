import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface LocalOption {
  _id: string;
  nombreNegocio: string;
  direccion?: string;
}

interface LocalSelectProps {
  value: string;
  onChange: (local: LocalOption) => void;
}

export default function LocalSelect({ value, onChange }: LocalSelectProps) {
  const [locales, setLocales] = useState<LocalOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/locales")
      .then((res) => res.json())
      .then((data) => {
        setLocales(
          Array.isArray(data.locales) ? data.locales : []
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Select
      value={value}
      onValueChange={(id) => {
        const found = locales.find((l) => l._id === id);
        if (found) onChange(found);
      }}
      disabled={loading}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={loading ? "Cargando locales..." : "Selecciona un local"}
        />
      </SelectTrigger>
      <SelectContent>
        {locales.map((l) => (
          <SelectItem key={l._id} value={l._id}>
            {l.nombreNegocio} {l.direccion ? `- ${l.direccion}` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
