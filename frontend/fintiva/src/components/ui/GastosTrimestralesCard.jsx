import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot,
} from "recharts";

// (Opcional) shadcn hover-card; comenta si no lo tienes
// import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export default function GastosTrimestralesCard({ idUsuario }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!idUsuario) return;
    fetch(`http://127.0.0.1:8000/metrics/gastos-trimestrales/${idUsuario}`)
      .then(r => r.json())
      .then(json => setData(json.items || []))
      .catch(console.error);
  }, [idUsuario]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const v = Number(payload[0].value || 0);
    return (
      <div className="rounded-xl border bg-white/95 p-3 shadow-lg text-sm">
        <div className="font-semibold mb-1">{label}</div>
        <div>Gasto total del trimestre: <b>${v.toLocaleString()}</b></div>
        <div className="text-xs text-muted-foreground mt-1">
          Tip: suma de agua, gas, luz, semillas, fertilizantes, mantenimiento y combustible.
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background rounded-lg border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Gastos Trimestrales</h3>
        {/* Descomenta si tienes hover-card
        <HoverCard openDelay={150}>
          <HoverCardTrigger className="text-xs underline text-muted-foreground cursor-help">
            ¿Cómo se calcula?
          </HoverCardTrigger>
          <HoverCardContent className="w-80 text-sm">
            Total por trimestre usando la fecha de creación del gasto.
          </HoverCardContent>
        </HoverCard>
        */}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="trimestre" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="total" dot={<Dot r={4} />} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
