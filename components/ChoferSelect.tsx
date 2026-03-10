import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface ChoferOption {
  _id: string;
  nombre: string;
}

interface ChoferSelectProps {
  value: string;
  onChange: (chofer: ChoferOption) => void;
}

export default function ChoferSelect({ value, onChange }: ChoferSelectProps) {
  const [choferes, setChoferes] = useState<ChoferOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/choferes")
      .then((res) => res.json())
      .then((data) => {
        setChoferes(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Select
      value={value}
      onValueChange={(id) => {
        const found = choferes.find((c) => c._id === id);
        if (found) onChange(found);
      }}
      disabled={loading}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={
            loading ? "Cargando choferes..." : "Selecciona un chofer"
          }
        />
      </SelectTrigger>
      <SelectContent>
        {choferes.map((c) => (
          <SelectItem key={c._id} value={c._id}>
            {c.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
