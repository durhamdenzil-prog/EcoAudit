import { FileText, BarChart3, Users, Loader, Download } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { generateReport, getReportDownloadUrl } from "../api";

export function QuickActions() {
  const [reportLoading, setReportLoading] = useState(false);
  const [reportUrl, setReportUrl] = useState("");
  const [error, setError] = useState("");

  const handleGenerateReport = async () => {
    setReportLoading(true);
    setError("");
    setReportUrl("");
    try {
      const data = await generateReport();
      setReportUrl(getReportDownloadUrl(data.filename));
    } catch {
      setError("Report failed. Upload documents first.");
    } finally {
      setReportLoading(false);
    }
  };

  const handleDownload = () => {
    if (reportUrl) {
      window.open(reportUrl, "_blank");
    }
  };

  return (
    <div className="bg-white border border-[var(--eco-border)] rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-[var(--eco-text-primary)] mb-4 flex items-center gap-2">
        <span>⚡</span> Quick Actions
      </h3>

      <div className="space-y-3">

        <button
          onClick={handleGenerateReport}
          disabled={reportLoading}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--eco-bg)] transition-colors group text-left disabled:opacity-50"
        >
          <div className="bg-[var(--eco-primary)] w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            {reportLoading
              ? <Loader className="w-5 h-5 text-white animate-spin" />
              : <FileText className="w-5 h-5 text-white" />
            }
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-[var(--eco-text-primary)]">
              {reportLoading ? "Generating..." : "Generate CBAM Report"}
            </p>
            <p className="text-xs text-[var(--eco-text-secondary)]">Download PDF report</p>
          </div>
        </button>

        {reportUrl && (
          <button
            onClick={handleDownload}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--eco-success-bg)] border border-[var(--eco-primary)] transition-colors"
          >
            <div className="bg-[var(--eco-primary)] w-10 h-10 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm text-[var(--eco-primary)]">Download Report PDF</p>
              <p className="text-xs text-[var(--eco-text-secondary)]">Click to open</p>
            </div>
          </button>
        )}

        {error && (
          <p className="text-xs text-red-600 px-3">⚠️ {error}</p>
        )}

        <Link
          to="/analytics"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--eco-bg)] transition-colors group"
        >
          <div className="bg-[var(--eco-secondary)] w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-[var(--eco-text-primary)]">Analytics</p>
            <p className="text-xs text-[var(--eco-text-secondary)]">Deep insights</p>
          </div>
        </Link>

        <Link
          to="/suppliers"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--eco-bg)] transition-colors group"
        >
          <div className="bg-[#0EA5E9] w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-[var(--eco-text-primary)]">Suppliers</p>
            <p className="text-xs text-[var(--eco-text-secondary)]">Manage suppliers</p>
          </div>
        </Link>

      </div>
    </div>
  );
}