import { TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";

interface KPICardProps {
  emoji: string;
  label: string;
  value: string;
  unit?: string;
  trend?: number;
  trendLabel?: string;
}

function KPICard({ emoji, label, value, unit, trend, trendLabel }: KPICardProps) {
  return (
    <div className="bg-white border border-[var(--eco-border)] rounded-[14px] p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1">
          <div className="text-xs font-semibold text-[var(--eco-text-secondary)] uppercase tracking-wide mb-2">
            {label}
          </div>
          <div className="text-3xl font-bold text-[var(--eco-text-primary)]">
            {value}
            {unit && <span className="text-lg font-normal text-[var(--eco-text-secondary)] ml-1">{unit}</span>}
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend > 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 text-red-600" />
                  <span className="text-xs font-semibold text-red-600">+{trend}%</span>
                </>
              ) : trend < 0 ? (
                <>
                  <TrendingDown className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-semibold text-green-600">{trend}%</span>
                </>
              ) : (
                <span className="text-xs font-semibold text-gray-600">0%</span>
              )}
              {trendLabel && (
                <span className="text-xs text-[var(--eco-text-secondary)] ml-1">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function KPICards() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        console.log("KPICards got stats:", data);
        setStats(data);
      })
      .catch((e) => {
        console.error("KPICards error:", e);
        setStats(null);
      })
      .finally(() => setLoading(false));
  }, []);

  console.log("KPICards rendering, stats:", stats, "loading:", loading);

  const kpis = [
    {
      emoji: "💨",
      label: "Total Emissions",
      value: loading ? "..." : (stats?.total_emissions_tons ?? 0).toLocaleString(),
      unit: "t CO₂e",
      trend: 8.2,
      trendLabel: "vs last month",
    },
    {
      emoji: "💶",
      label: "CBAM Liability",
      value: loading ? "..." : `€${(stats?.total_cbam_cost_eur ?? 0).toLocaleString()}`,
      unit: "",
      trend: 8.2,
      trendLabel: "vs last month",
    },
    {
      emoji: "🏭",
      label: "Suppliers",
      value: loading ? "..." : String(stats?.total_suppliers ?? 0),
      unit: "",
      trend: 0,
      trendLabel: "verified",
    },
    {
      emoji: "📦",
      label: "Products",
      value: loading ? "..." : String(stats?.total_products ?? 0),
      unit: "",
      trend: -2.1,
      trendLabel: "avg intensity",
    },
    {
      emoji: "✅",
      label: "Compliance Score",
      value: loading ? "..." : String(stats?.compliance_score?.toFixed(0) ?? 0),
      unit: "%",
      trend: 5.0,
      trendLabel: "vs last quarter",
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}