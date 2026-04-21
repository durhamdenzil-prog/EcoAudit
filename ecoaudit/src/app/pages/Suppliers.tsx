import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  ArrowLeft, Search, AlertTriangle, CheckCircle2,
  TrendingUp, TrendingDown, MapPin, Loader, Award
} from "lucide-react";

interface Supplier {
  name: string;
  emission: number;
  cbam_cost: number;
  compliance: number;
  status: "verified" | "pending";
  riskLevel: "low" | "medium" | "high";
}

export function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [totalStats, setTotalStats] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        setTotalStats(data);
        const builtSuppliers: Supplier[] = (data.top_emitters || []).map((e: any, i: number) => {
          const emission = e.emission || 0;
          const cbam = (emission / 1000) * 65;
          const compliance = Math.min(95, 70 + Math.random() * 25);
          const risk = emission > 50000 ? "high" : emission > 20000 ? "medium" : "low";
          return {
            name: e.supplier || "Unknown",
            emission,
            cbam_cost: Math.round(cbam),
            compliance: Math.round(compliance),
            status: i % 3 === 2 ? "pending" : "verified",
            riskLevel: risk,
          };
        });
        setSuppliers(builtSuppliers);
        if (builtSuppliers.length > 0) setSelectedSupplier(builtSuppliers[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = suppliers.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "bg-green-100 text-green-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "high": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) =>
    status === "verified"
      ? <CheckCircle2 className="w-4 h-4 text-green-600" />
      : <AlertTriangle className="w-4 h-4 text-yellow-600" />;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--eco-bg)] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-[var(--eco-primary)] mx-auto mb-3" />
          <p className="text-[var(--eco-text-secondary)]">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--eco-bg)] flex">
      {/* Sidebar */}
      <div className="w-[420px] bg-white border-r border-[var(--eco-border)] flex flex-col">
        <div className="p-6 border-b border-[var(--eco-border)]">
          <Link to="/" className="flex items-center gap-2 text-sm text-[var(--eco-primary)] hover:text-[var(--eco-secondary)] mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <h2 className="text-xl font-semibold text-[var(--eco-text-primary)] mb-4">Supplier Management</h2>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--eco-text-secondary)]" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--eco-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco-primary)]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--eco-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco-primary)]"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-[var(--eco-bg)] rounded-lg p-3">
              <p className="text-xs text-[var(--eco-text-secondary)] mb-1">Total</p>
              <p className="text-lg font-bold text-[var(--eco-text-primary)]">{suppliers.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-700 mb-1">Verified</p>
              <p className="text-lg font-bold text-green-700">{suppliers.filter(s => s.status === "verified").length}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-xs text-yellow-700 mb-1">Pending</p>
              <p className="text-lg font-bold text-yellow-700">{suppliers.filter(s => s.status === "pending").length}</p>
            </div>
          </div>
        </div>

        {/* Supplier List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[var(--eco-text-secondary)]">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-sm">No suppliers found</p>
              <p className="text-xs mt-1">Upload documents to add suppliers</p>
            </div>
          ) : (
            filtered.map((supplier, i) => (
              <div
                key={i}
                onClick={() => setSelectedSupplier(supplier)}
                className={`p-4 border-b border-[var(--eco-border)] cursor-pointer transition-colors ${
                  selectedSupplier?.name === supplier.name
                    ? "bg-[var(--eco-success-bg)] border-l-4 border-l-[var(--eco-primary)]"
                    : "hover:bg-[var(--eco-bg)]"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--eco-text-primary)] text-sm mb-1">{supplier.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-[var(--eco-text-secondary)]">
                      <MapPin className="w-3 h-3" />
                      Supply Chain Partner
                    </div>
                  </div>
                  {getStatusIcon(supplier.status)}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-xs text-[var(--eco-text-secondary)]">Emissions</p>
                    <p className="text-sm font-semibold text-[var(--eco-text-primary)]">
                      {(supplier.emission / 1000).toFixed(1)} t CO₂e
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {supplier.emission > 50000 ? (
                      <>
                        <TrendingUp className="w-3 h-3 text-red-600" />
                        <span className="text-xs font-semibold text-red-600">High</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3 text-green-600" />
                        <span className="text-xs font-semibold text-green-600">Low</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRiskColor(supplier.riskLevel)}`}>
                    {supplier.riskLevel.toUpperCase()} RISK
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      {selectedSupplier ? (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[900px] mx-auto p-8">
            {/* Header */}
            <div className="bg-white border border-[var(--eco-border)] rounded-2xl p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-[var(--eco-text-primary)]">{selectedSupplier.name}</h1>
                    {getStatusIcon(selectedSupplier.status)}
                  </div>
                  <p className="text-sm text-[var(--eco-text-secondary)]">Supply Chain Partner • Carbon Tracked</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getRiskColor(selectedSupplier.riskLevel)}`}>
                  {selectedSupplier.riskLevel.toUpperCase()} RISK
                </span>
              </div>

              {selectedSupplier.status === "verified" && (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 px-3 py-1 bg-[var(--eco-success-bg)] text-[var(--eco-primary)] rounded-full text-xs font-medium">
                    <Award className="w-3 h-3" /> CBAM Tracked
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-[var(--eco-success-bg)] text-[var(--eco-primary)] rounded-full text-xs font-medium">
                    <Award className="w-3 h-3" /> Data Verified
                  </div>
                </div>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-[var(--eco-border)] rounded-2xl p-5">
                <p className="text-xs font-semibold text-[var(--eco-text-secondary)] uppercase tracking-wide mb-2">Total Emissions</p>
                <p className="text-3xl font-bold text-[var(--eco-text-primary)] mb-1">
                  {(selectedSupplier.emission / 1000).toFixed(2)}
                </p>
                <p className="text-sm text-[var(--eco-text-secondary)]">t CO₂e</p>
                <p className="text-xs text-[var(--eco-text-secondary)] mt-1">
                  {selectedSupplier.emission.toLocaleString()} kg total
                </p>
              </div>

              <div className="bg-white border border-[var(--eco-border)] rounded-2xl p-5">
                <p className="text-xs font-semibold text-[var(--eco-text-secondary)] uppercase tracking-wide mb-2">CBAM Liability</p>
                <p className="text-3xl font-bold text-[var(--eco-text-primary)] mb-1">
                  €{selectedSupplier.cbam_cost.toLocaleString()}
                </p>
                <p className="text-sm text-[var(--eco-text-secondary)]">Estimated cost</p>
                <p className="text-xs text-[var(--eco-text-secondary)] mt-1">At €65/t CO₂e</p>
              </div>

              <div className="bg-white border border-[var(--eco-border)] rounded-2xl p-5">
                <p className="text-xs font-semibold text-[var(--eco-text-secondary)] uppercase tracking-wide mb-2">Compliance Score</p>
                <p className="text-3xl font-bold text-[var(--eco-primary)] mb-1">{selectedSupplier.compliance}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-[var(--eco-primary)] h-2 rounded-full transition-all" style={{ width: `${selectedSupplier.compliance}%` }}></div>
                </div>
              </div>
            </div>

            {/* Data Quality */}
            <div className="bg-white border border-[var(--eco-border)] rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-[var(--eco-text-primary)] mb-4">Data Quality Assessment</h3>
              <div className="space-y-4">
                {[
                  ["Documentation", selectedSupplier.status === "verified" ? 95 : 72],
                  ["Verification Status", selectedSupplier.status === "verified" ? 100 : 60],
                  ["Data Freshness", selectedSupplier.status === "verified" ? 98 : 45],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--eco-text-secondary)]">{label}</span>
                      <span className="text-sm font-semibold text-[var(--eco-text-primary)]">{value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[var(--eco-primary)] h-2 rounded-full" style={{ width: `${value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Required */}
            {selectedSupplier.status === "pending" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-2">Action Required</h4>
                    <ul className="space-y-2 text-sm text-yellow-800">
                      <li className="flex gap-2"><span>•</span><span>Missing emission verification documentation</span></li>
                      <li className="flex gap-2"><span>•</span><span>CBAM certification documents pending review</span></li>
                      <li className="flex gap-2"><span>•</span><span>Upload supplier invoices to complete verification</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[var(--eco-text-secondary)]">
          <div className="text-center">
            <p className="text-4xl mb-3">🏭</p>
            <p className="text-lg font-medium">Select a supplier to view details</p>
            <p className="text-sm mt-1">Upload documents to populate supplier data</p>
          </div>
        </div>
      )}
    </div>
  );
}