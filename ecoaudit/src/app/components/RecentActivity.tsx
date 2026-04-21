import { FileCheck, Upload, AlertCircle, TrendingDown, Loader } from "lucide-react";
import { useEffect, useState } from "react";

interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon: typeof FileCheck;
  color: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        const builtActivities: Activity[] = [];
        const topEmitters = data.top_emitters || [];
        const totalSuppliers = data.total_suppliers || 0;
        const totalProducts = data.total_products || 0;
        const totalEmissions = data.total_emissions_tons || 0;
        const cbamCost = data.total_cbam_cost_eur || 0;

        // Activity: documents uploaded
        if (totalSuppliers > 0) {
          builtActivities.push({
            id: "1",
            title: "Documents Processed",
            description: `${totalSuppliers} supplier(s) and ${totalProducts} product(s) ingested into knowledge graph`,
            timestamp: "Just now",
            icon: Upload,
            color: "text-blue-600",
          });
        }

        // Activity: top emitter found
        if (topEmitters.length > 0) {
          builtActivities.push({
            id: "2",
            title: "Top Emitter Identified",
            description: `${topEmitters[0].supplier} — ${(topEmitters[0].emission / 1000).toFixed(1)} t CO₂e recorded`,
            timestamp: "Recently",
            icon: AlertCircle,
            color: "text-yellow-600",
          });
        }

        // Activity: CBAM cost calculated
        if (cbamCost > 0) {
          builtActivities.push({
            id: "3",
            title: "CBAM Liability Calculated",
            description: `Total estimated CBAM cost: €${cbamCost.toLocaleString()} at €65/t CO₂e`,
            timestamp: "Recently",
            icon: FileCheck,
            color: "text-green-600",
          });
        }

        // Activity: emissions tracked
        if (totalEmissions > 0) {
          builtActivities.push({
            id: "4",
            title: "Emissions Tracked",
            description: `${totalEmissions.toFixed(2)} t CO₂e total emissions recorded across all suppliers`,
            timestamp: "Today",
            icon: TrendingDown,
            color: "text-green-600",
          });
        }

        // Activity: second emitter
        if (topEmitters.length > 1) {
          builtActivities.push({
            id: "5",
            title: "Supplier Data Updated",
            description: `${topEmitters[1].supplier} — ${(topEmitters[1].emission / 1000).toFixed(1)} t CO₂e recorded`,
            timestamp: "Today",
            icon: FileCheck,
            color: "text-blue-600",
          });
        }

        // Default if no data
        if (builtActivities.length === 0) {
          builtActivities.push({
            id: "default",
            title: "No Activity Yet",
            description: "Upload supplier documents to start tracking carbon emissions",
            timestamp: "Now",
            icon: Upload,
            color: "text-gray-400",
          });
        }

        setActivities(builtActivities);
      })
      .catch(() => {
        setActivities([{
          id: "err",
          title: "Connection Error",
          description: "Could not fetch activity data. Make sure backend is running.",
          timestamp: "Now",
          icon: AlertCircle,
          color: "text-red-600",
        }]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white border border-[var(--eco-border)] rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-[var(--eco-text-primary)] mb-4 flex items-center gap-2">
        <span>📋</span> Recent Activity
      </h3>

      {loading ? (
        <div className="flex items-center gap-2 text-[var(--eco-text-secondary)] text-sm py-4">
          <Loader className="w-4 h-4 animate-spin" />
          Loading activity...
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`mt-0.5 ${activity.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--eco-text-primary)] mb-0.5">
                    {activity.title}
                  </p>
                  <p className="text-xs text-[var(--eco-text-secondary)] mb-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-[var(--eco-text-secondary)]">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button className="w-full mt-4 pt-4 border-t border-[var(--eco-border)] text-sm text-[var(--eco-primary)] hover:text-[var(--eco-secondary)] font-medium transition-colors">
        View All Activity
      </button>
    </div>
  );
}