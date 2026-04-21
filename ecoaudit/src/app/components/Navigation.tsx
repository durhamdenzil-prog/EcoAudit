import { Leaf, FileDown, LayoutDashboard, Network, Users, BarChart3 } from "lucide-react";
import { Link, useLocation } from "react-router";

export function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/suppliers", label: "Suppliers", icon: Users },
    { path: "/knowledge-graph", label: "Knowledge Graph", icon: Network },
  ];
  
  return (
    <nav className="h-[60px] bg-white border-b border-[var(--eco-border)] sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-[var(--eco-primary)]" />
            <span className="text-lg font-semibold text-[var(--eco-text-primary)]">EcoAudit</span>
          </Link>
          <span className="px-3 py-1 text-xs font-medium text-[var(--eco-primary)] border border-[var(--eco-primary)] rounded-full">
            CBAM Compliance
          </span>
          
          <div className="flex items-center gap-1 ml-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
                    location.pathname === item.path
                      ? "bg-[var(--eco-success-bg)] text-[var(--eco-primary)] font-medium"
                      : "text-[var(--eco-text-secondary)] hover:text-[var(--eco-primary)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-[var(--eco-text-secondary)]">
            Carbon price: <span className="font-semibold text-[var(--eco-text-primary)]">€65/t</span>
          </div>
          <Link 
            to="/report"
            className="px-4 py-2 bg-[var(--eco-primary)] text-white rounded-lg hover:bg-[var(--eco-secondary)] transition-colors flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            CBAM Report
          </Link>
        </div>
      </div>
    </nav>
  );
}