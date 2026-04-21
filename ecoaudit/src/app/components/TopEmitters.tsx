import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { useState, useEffect } from "react";
import { getDashboardStats } from "../api";

export function TopEmitters() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((stats) => {
        const emitters = (stats.top_emitters || []).map((e: any) => ({
          name: e.supplier?.length > 12 ? e.supplier.slice(0, 12) + "..." : e.supplier,
          fullName: e.supplier,
          emissions: Math.round((e.emission || 0) / 1000),
          raw: e.emission || 0,
        }));
        setData(emitters);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white border border-[var(--eco-border)] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--eco-text-primary)] flex items-center gap-2">
          <span>📊</span> Top Emitters
        </h3>
        <select className="px-3 py-1.5 text-xs border border-[var(--eco-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--eco-primary)]">
          <option>All Time</option>
          <option>Last Quarter</option>
          <option>Last Year</option>
        </select>
      </div>

      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--eco-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="h-[300px] flex flex-col items-center justify-center text-[var(--eco-text-secondary)]">
          <span className="text-4xl mb-3">📭</span>
          <p className="text-sm font-medium">No emission data yet</p>
          <p className="text-xs mt-1">Upload documents to see top emitters</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
            onMouseMove={(state) => {
              if (state.isTooltipActive && state.activeTooltipIndex !== undefined) {
                setActiveIndex(state.activeTooltipIndex);
              } else {
                setActiveIndex(null);
              }
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              angle={-15}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fill: "#6B7280", fontSize: 12 }}
              label={{ value: "t CO₂e", angle: -90, position: "insideLeft", style: { fill: "#6B7280" } }}
            />
            <Tooltip
              cursor={{ fill: "rgba(15, 92, 65, 0.1)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-[var(--eco-border)] rounded-lg shadow-lg">
                      <p className="font-semibold text-sm text-[var(--eco-text-primary)] mb-1">
                        {d.fullName}
                      </p>
                      <p className="text-xs text-[var(--eco-text-secondary)]">
                        <span className="font-semibold text-[var(--eco-primary)]">
                          {d.emissions.toLocaleString()}
                        </span> t CO₂e
                      </p>
                      <p className="text-xs text-[var(--eco-text-secondary)]">
                        {d.raw.toLocaleString()} kg total
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="emissions" radius={[8, 8, 0, 0]}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={activeIndex === index ? "#1A7F5A" : "#0F5C41"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}