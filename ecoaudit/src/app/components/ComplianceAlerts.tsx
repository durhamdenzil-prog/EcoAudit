import { AlertTriangle, CheckCircle2, Clock, X, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

interface Alert {
  id: string;
  type: "warning" | "success" | "info";
  title: string;
  message: string;
  action?: string;
  actionRoute?: string;
}

export function ComplianceAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        const builtAlerts: Alert[] = [];
        const totalSuppliers = data.total_suppliers || 0;
        const totalEmissions = data.total_emissions_tons || 0;
        const cbamCost = data.total_cbam_cost_eur || 0;
        const compliance = data.compliance_score || 0;
        const topEmitters = data.top_emitters || [];

        if (totalEmissions > 100) {
          builtAlerts.push({
            id: "1", type: "warning",
            title: "High Emission Level Detected",
            message: `Total emissions at ${totalEmissions.toFixed(1)} t CO₂e — exceeds recommended threshold.`,
            action: "Review Now", actionRoute: "/suppliers",
          });
        }

        if (cbamCost > 5000) {
          builtAlerts.push({
            id: "2", type: "warning",
            title: "CBAM Liability Alert",
            message: `Estimated CBAM cost is €${cbamCost.toLocaleString()} — ensure certificates are ready.`,
            action: "View Report", actionRoute: "/report",
          });
        }

        if (compliance >= 80) {
          builtAlerts.push({
            id: "3", type: "success",
            title: "Compliance Milestone",
            message: `Compliance score is ${compliance.toFixed(0)}% — ${totalSuppliers} suppliers tracked and CBAM compliant.`,
          });
        }

        if (topEmitters.length > 0) {
          builtAlerts.push({
            id: "4", type: "info",
            title: "Top Emitter Identified",
            message: `${topEmitters[0].supplier} is your highest emitter at ${(topEmitters[0].emission / 1000).toFixed(1)} t CO₂e.`,
            action: "View Suppliers", actionRoute: "/suppliers",
          });
        }

        if (totalSuppliers > 0) {
          builtAlerts.push({
            id: "5", type: "success",
            title: "Data Successfully Ingested",
            message: `${totalSuppliers} supplier(s) and ${data.total_products || 0} product(s) tracked in knowledge graph.`,
            action: "View Graph", actionRoute: "/knowledge-graph",
          });
        }

        if (builtAlerts.length === 0) {
          builtAlerts.push({
            id: "6", type: "info",
            title: "No Data Yet",
            message: "Upload supplier invoices to start tracking carbon emissions.",
            action: "Upload Now", actionRoute: "/",
          });
        }

        setAlerts(builtAlerts);
      })
      .catch(() => {
        setAlerts([{
          id: "err", type: "warning",
          title: "Backend Connection Issue",
          message: "Could not fetch data. Make sure backend is running at localhost:8000.",
        }]);
      })
      .finally(() => setLoading(false));
  }, []);

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[var(--eco-text-secondary)] text-sm p-2">
        <Loader className="w-4 h-4 animate-spin" />
        Loading alerts...
      </div>
    );
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`border rounded-2xl p-4 flex items-start gap-3 ${
            alert.type === "warning" ? "bg-yellow-50 border-yellow-200"
            : alert.type === "success" ? "bg-green-50 border-green-200"
            : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="mt-0.5">
            {alert.type === "warning" && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
            {alert.type === "success" && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            {alert.type === "info" && <Clock className="w-5 h-5 text-blue-600" />}
          </div>

          <div className="flex-1">
            <h4 className={`font-semibold text-sm mb-1 ${
              alert.type === "warning" ? "text-yellow-900"
              : alert.type === "success" ? "text-green-900"
              : "text-blue-900"
            }`}>
              {alert.title}
            </h4>
            <p className={`text-sm ${
              alert.type === "warning" ? "text-yellow-800"
              : alert.type === "success" ? "text-green-800"
              : "text-blue-800"
            }`}>
              {alert.message}
            </p>
          </div>

          {alert.action && alert.actionRoute && (
            <button
              onClick={() => navigate(alert.actionRoute!)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                alert.type === "warning" ? "bg-yellow-600 text-white hover:bg-yellow-700"
                : alert.type === "success" ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {alert.action}
            </button>
          )}

          <button
            onClick={() => dismissAlert(alert.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}