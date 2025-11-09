import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// (Opcional) shadcn hover-card; comenta si no tienes este componente instalado
// import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export default function ParcelaCultivosChart({ idUsuario }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!idUsuario) return;
    fetch(`http://127.0.0.1:8000/metrics/parcelas-cultivos/${idUsuario}`)
      .then(r => r.json())
      .then(json => setData(json.items || []))
      .catch(console.error);
  }, [idUsuario]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const v = payload[0].value;
    return (
      <div className="rounded-xl border bg-white/95 p-3 shadow-lg text-sm">
        <div className="font-semibold mb-1">{label}</div>
        <div>Cultivos registrados: <b>{v}</b></div>
        <div className="text-xs text-muted-foreground mt-1">
          Tip: si está en 0, registra un cultivo en la sección “Cultivos”.
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background rounded-lg border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Parcelas y Cultivos</h3>
        {/* Descomenta si tienes hover-card
        <HoverCard openDelay={150}>
          <HoverCardTrigger className="text-xs underline text-muted-foreground cursor-help">
            ¿Qué es esto?
          </HoverCardTrigger>
          <HoverCardContent className="w-80 text-sm">
            Número de cultivos por parcela. Pasa el mouse sobre una barra para ver el detalle.
          </HoverCardContent>
        </HoverCard>
        */}
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="parcela" />
            <YAxis allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="cultivos" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
