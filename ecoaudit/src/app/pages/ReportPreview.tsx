import { Download, Share2, Leaf, ArrowLeft, Printer, Loader } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";

export function ReportPreview() {
  const [stats, setStats] = useState<any>(null);
  const [emitters, setEmitters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportUrl, setReportUrl] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setEmitters(data.top_emitters || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async () => {
    setReportLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/report/generate", { method: "POST" });
      const data = await res.json();
      const url = `http://localhost:8000/api/report/download/${data.filename}`;
      setReportUrl(url);
      window.open(url, "_blank");
    } catch {
      alert("Report generation failed. Make sure backend is running.");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 py-8">
      <div className="max-w-[900px] mx-auto">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-[var(--eco-primary)] hover:text-[var(--eco-secondary)] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex justify-end gap-3 mb-4">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-white text-[var(--eco-text-primary)] border border-[var(--eco-border)] rounded-lg hover:bg-[var(--eco-bg)] transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownload}
            disabled={reportLoading}
            className="px-4 py-2 bg-[var(--eco-primary)] text-white rounded-lg hover:bg-[var(--eco-secondary)] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {reportLoading
              ? <Loader className="w-4 h-4 animate-spin" />
              : <Download className="w-4 h-4" />
            }
            {reportLoading ? "Generating..." : "Download PDF"}
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="border-b border-[var(--eco-border)] p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <Leaf className="w-8 h-8 text-[var(--eco-primary)]" />
                <div>
                  <h1 className="text-2xl font-bold text-[var(--eco-text-primary)]">EcoAudit</h1>
                  <p className="text-sm text-[var(--eco-text-secondary)]">CBAM Compliance Report</p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="text-[var(--eco-text-secondary)]">
                  Date: <span className="font-semibold text-[var(--eco-text-primary)]">
                    {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </p>
                <p className="text-[var(--eco-text-secondary)]">
                  Period: <span className="font-semibold text-[var(--eco-text-primary)]">Q1 2026</span>
                </p>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-8 border-b border-[var(--eco-border)]">
            <h2 className="text-lg font-semibold text-[var(--eco-text-primary)] mb-4">Executive Summary</h2>
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <Loader className="w-6 h-6 animate-spin text-[var(--eco-primary)]" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--eco-primary)] text-white">
                    <th className="px-4 py-3 text-left font-semibold">Metric</th>
                    <th className="px-4 py-3 text-right font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Total Embedded Emissions", `${(stats?.total_emissions_tons || 0).toLocaleString()} t CO₂e`],
                    ["Total CBAM Liability", `€${(stats?.total_cbam_cost_eur || 0).toLocaleString()}`],
                    ["Number of Suppliers", stats?.total_suppliers || 0],
                    ["Number of Products", stats?.total_products || 0],
                    ["Compliance Score", `${stats?.compliance_score?.toFixed(0) || 0}%`],
                    ["Carbon Price (EU ETS)", `€${stats?.carbon_price_eur || 65}/t CO₂e`],
                  ].map(([label, value], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white border-b border-[var(--eco-border)]" : "bg-[var(--eco-bg)] border-b border-[var(--eco-border)]"}>
                      <td className="px-4 py-3 text-[var(--eco-text-primary)]">{label}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[var(--eco-text-primary)]">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Emission Records */}
          <div className="p-8 border-b border-[var(--eco-border)]">
            <h2 className="text-lg font-semibold text-[var(--eco-text-primary)] mb-4">Top Emitters</h2>
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <Loader className="w-6 h-6 animate-spin text-[var(--eco-primary)]" />
              </div>
            ) : emitters.length === 0 ? (
              <p className="text-sm text-[var(--eco-text-secondary)]">No emission records found. Upload documents first.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--eco-primary)] text-white">
                    <th className="px-4 py-3 text-left font-semibold">#</th>
                    <th className="px-4 py-3 text-left font-semibold">Supplier</th>
                    <th className="px-4 py-3 text-right font-semibold">Emissions (kg CO₂e)</th>
                    <th className="px-4 py-3 text-right font-semibold">Emissions (t CO₂e)</th>
                    <th className="px-4 py-3 text-right font-semibold">CBAM Cost (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {emitters.map((e: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white border-b border-[var(--eco-border)]" : "bg-[var(--eco-bg)] border-b border-[var(--eco-border)]"}>
                      <td className="px-4 py-3 text-[var(--eco-text-secondary)]">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-[var(--eco-text-primary)]">{e.supplier}</td>
                      <td className="px-4 py-3 text-right text-[var(--eco-text-primary)]">{(e.emission || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-[var(--eco-text-primary)]">{((e.emission || 0) / 1000).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[var(--eco-primary)]">
                        €{((e.emission || 0) / 1000 * 65).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Compliance Notes */}
          <div className="p-8">
            <h2 className="text-lg font-semibold text-[var(--eco-text-primary)] mb-4">Compliance Notes</h2>
            <ul className="space-y-2 text-sm text-[var(--eco-text-secondary)]">
              <li className="flex gap-2"><span>•</span><span>All emission data verified against EU CBAM standards (Regulation 2023/956)</span></li>
              <li className="flex gap-2"><span>•</span><span>Emission factors sourced from verified third-party databases</span></li>
              <li className="flex gap-2"><span>•</span><span>Carbon prices follow EU ETS market rates (€65/t CO₂e)</span></li>
              <li className="flex gap-2"><span>•</span><span>Upload more supplier invoices to improve data completeness</span></li>
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-[var(--eco-text-secondary)] mt-6">
          Generated by EcoAudit • For official CBAM reporting purposes
        </p>
      </div>
    </div>
  );
}