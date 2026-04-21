import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft, TrendingUp, TrendingDown, Download, Loader } from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend
} from "recharts";

const COLORS = ["#0F5C41", "#1A7F5A", "#22C55E", "#4ADE80", "#86EFAC"];

export function Analytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6m");

  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Build pie chart data from top emitters
  const emittersPieData = (stats?.top_emitters || []).map((e: any, i: number) => ({
    name: e.supplier,
    value: Math.round((e.emission || 0) / 1000),
    color: COLORS[i % COLORS.length],
  }));

  const totalTons = stats?.total_emissions_tons || 0;

  // Build carbon intensity from top emitters
  const intensityData = (stats?.top_emitters || []).slice(0, 5).map((e: any) => ({
    product: e.supplier?.length > 12 ? e.supplier.slice(0, 12) + "..." : e.supplier,
    intensity: parseFloat(((e.emission || 0) / 1000).toFixed(2)),
    benchmark: parseFloat(((e.emission || 0) / 1000 * 0.85).toFixed(2)),
  }));

  // Simulated trend data based on real total
  const trendData = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"].map((month, i) => ({
    month,
    emissions: Math.round(totalTons * (0.8 + i * 0.05)),
    target: Math.round(totalTons * 0.85),
  }));

  return (
    <div className="min-h-screen bg-[var(--eco-bg)]">
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 text-sm text-[var(--eco-primary)] hover:text-[var(--eco-secondary)] mb-3">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-[var(--eco-text-primary)]">Analytics Dashboard</h1>
            <p className="text-sm text-[var(--eco-text-secondary)] mt-1">Deep dive into your carbon footprint and compliance metrics</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-[var(--eco-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco-primary)] bg-white"
            >
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
            </select>
            <button className="px-4 py-2 bg-white border border-[var(--eco-border)] text-[var(--eco-text-primary)] rounded-lg hover:bg-[var(--eco-bg)] transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        {/* Key Insights */}
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <Loader className="w-6 h-6 animate-spin text-[var(--eco-primary)]" />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-[var(--eco-border)] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[var(--eco-text-secondary)] uppercase tracking-wide">Total Emissions</span>
                <div className="flex items-center gap-1 text-red-600">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs font-semibold">+8.2%</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--eco-text-primary)]">{totalTons.toLocaleString()}</p>
              <p className="text-xs text-[var(--eco-text-secondary)] mt-1">t CO₂e total</p>
            </div>

            <div className="bg-white border border-[var(--eco-border)] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[var(--eco-text-secondary)] uppercase tracking-wide">CBAM Cost</span>
                <div className="flex items-center gap-1 text-red-600">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs font-semibold">+8.2%</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--eco-text-primary)]">€{(stats?.total_cbam_cost_eur || 0).toLocaleString()}</p>
              <p className="text-xs text-[var(--eco-text-secondary)] mt-1">estimated liability</p>
            </div>

            <div className="bg-white border border-[var(--eco-border)] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[var(--eco-text-secondary)] uppercase tracking-wide">Suppliers</span>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingDown className="w-3 h-3" />
                  <span className="text-xs font-semibold">-2.1%</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--eco-text-primary)]">{stats?.total_suppliers || 0}</p>
              <p className="text-xs text-[var(--eco-text-secondary)] mt-1">active suppliers</p>
            </div>

            <div className="bg-white border border-[var(--eco-border)] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[var(--eco-text-secondary)] uppercase tracking-wide">Compliance</span>
                <span className="text-xs font-semibold text-[var(--eco-primary)]">{stats?.compliance_score?.toFixed(0) || 0}%</span>
              </div>
              <p className="text-2xl font-bold text-[var(--eco-text-primary)]">{stats?.total_products || 0}</p>
              <p className="text-xs text-[var(--eco-text-secondary)] mt-1">products tracked</p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Trend Chart */}
          <div className="bg-white border border-[var(--eco-border)] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--eco-text-primary)]">Emissions Trend vs Target</h3>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#0F5C41]"></div>
                  <span className="text-[var(--eco-text-secondary)]">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#D97706]"></div>
                  <span className="text-[var(--eco-text-secondary)]">Target</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F5C41" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0F5C41" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="emissions" stroke="#0F5C41" strokeWidth={3} fillOpacity={1} fill="url(#colorEmissions)" name="Actual (t CO₂e)" />
                <Area type="monotone" dataKey="target" stroke="#D97706" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Target (t CO₂e)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Emissions by Supplier Pie */}
          <div className="bg-white border border-[var(--eco-border)] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[var(--eco-text-primary)] mb-6">Emissions by Supplier</h3>
            {loading ? (
              <div className="flex items-center justify-center h-[280px]">
                <Loader className="w-6 h-6 animate-spin text-[var(--eco-primary)]" />
              </div>
            ) : emittersPieData.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-[var(--eco-text-secondary)] text-sm">
                No data yet — upload documents first
              </div>
            ) : (
              <div className="flex items-center">
                <ResponsiveContainer width="50%" height={280}>
                  <PieChart>
                    <Pie data={emittersPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {emittersPieData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toLocaleString()} t CO₂e`} contentStyle={{ backgroundColor: "white", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {emittersPieData.map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                        <span className="text-xs text-[var(--eco-text-primary)] truncate max-w-[80px]">{s.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-[var(--eco-text-primary)]">{s.value.toLocaleString()} t</p>
                        <p className="text-xs text-[var(--eco-text-secondary)]">
                          {totalTons > 0 ? ((s.value / totalTons) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Carbon Intensity Chart */}
        <div className="bg-white border border-[var(--eco-border)] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[var(--eco-text-primary)] mb-6">Carbon Intensity by Supplier</h3>
          {loading ? (
            <div className="flex items-center justify-center h-[280px]">
              <Loader className="w-6 h-6 animate-spin text-[var(--eco-primary)]" />
            </div>
          ) : intensityData.length === 0 ? (
            <div className="flex items-center justify-center h-[280px] text-[var(--eco-text-secondary)] text-sm">
              No data yet — upload documents first
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={intensityData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="product" tick={{ fill: "#6B7280", fontSize: 11 }} angle={-15} textAnchor="end" height={80} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
                <Bar dataKey="intensity" fill="#0F5C41" radius={[8, 8, 0, 0]} name="Actual (t CO₂e)" />
                <Bar dataKey="benchmark" fill="#D97706" radius={[8, 8, 0, 0]} name="Target (85%)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}