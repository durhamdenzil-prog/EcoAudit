import { KPICards } from "../components/KPICards";
import { UploadDocuments } from "../components/UploadDocuments";
import { TopEmitters } from "../components/TopEmitters";
import { AskSupplyChain } from "../components/AskSupplyChain";
import { RecentActivity } from "../components/RecentActivity";
import { ComplianceAlerts } from "../components/ComplianceAlerts";
import { QuickActions } from "../components/QuickActions";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-[var(--eco-bg)]">
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--eco-text-primary)] mb-1">
            Carbon Footprint Dashboard
          </h1>
          <p className="text-sm text-[var(--eco-text-secondary)]">
            Monitor your CBAM compliance and emissions in real-time
          </p>
        </div>

        <div className="mb-6">
          <KPICards />
        </div>

        {/* Alerts Section */}
        <div className="mb-6">
          <ComplianceAlerts />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2">
            <UploadDocuments />
          </div>
          
          <div>
            <QuickActions />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            <TopEmitters />
            <RecentActivity />
          </div>
          
          <div>
            <AskSupplyChain />
          </div>
        </div>
      </div>
    </div>
  );
}