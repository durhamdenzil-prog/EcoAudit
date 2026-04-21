import { useState, useEffect } from "react";
import { Download, Filter, ArrowLeft, Loader } from "lucide-react";
import { Link } from "react-router";

interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
  type: "supplier" | "product" | "emission";
  emission?: number;
}

interface Edge {
  from: string;
  to: string;
  label: string;
}

const getNodeColor = (type: GraphNode["type"]) => {
  switch (type) {
    case "supplier": return "#1A7F5A";
    case "product": return "#0EA5E9";
    case "emission": return "#D97706";
  }
};

const getNodeSize = (type: GraphNode["type"]) => {
  switch (type) {
    case "supplier": return 50;
    case "product": return 40;
    case "emission": return 28;
  }
};

export function KnowledgeGraph() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [supplierFilter, setSupplierFilter] = useState("all");

  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        buildGraph(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const buildGraph = (data: any) => {
    const emitters: any[] = data.top_emitters || [];
    const builtNodes: GraphNode[] = [];
    const builtEdges: Edge[] = [];

    // Add supplier nodes
    emitters.forEach((e: any, i: number) => {
      const supplierId = `s${i}`;
      builtNodes.push({
        id: supplierId,
        x: 150,
        y: 100 + i * 120,
        label: e.supplier?.length > 14 ? e.supplier.slice(0, 14) + "..." : e.supplier,
        type: "supplier",
        emission: e.emission,
      });

      // Add product node
      const productId = `p${i}`;
      builtNodes.push({
        id: productId,
        x: 450,
        y: 100 + i * 120,
        label: `Product ${i + 1}`,
        type: "product",
      });

      // Add emission node
      const emissionId = `e${i}`;
      builtNodes.push({
        id: emissionId,
        x: 750,
        y: 100 + i * 120,
        label: `${Math.round((e.emission || 0) / 1000)}t CO₂`,
        type: "emission",
        emission: e.emission,
      });

      builtEdges.push({ from: supplierId, to: productId, label: "SUPPLIES" });
      builtEdges.push({ from: supplierId, to: emissionId, label: "EMITS" });
    });

    setNodes(builtNodes);
    setEdges(builtEdges);
    if (builtNodes.length > 0) setSelectedNode(builtNodes[0]);
  };

  const suppliers = nodes.filter((n) => n.type === "supplier");
  const filteredNodes = supplierFilter === "all"
    ? nodes
    : nodes.filter((n) => {
        if (n.type === "supplier") return n.label.includes(supplierFilter);
        const suppIdx = suppliers.findIndex((s) => s.label.includes(supplierFilter));
        if (suppIdx === -1) return false;
        return n.id.endsWith(String(suppIdx));
      });

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-[320px] bg-white p-6 overflow-y-auto flex-shrink-0">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-[var(--eco-primary)] hover:text-[var(--eco-secondary)] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h2 className="text-xl font-semibold text-[var(--eco-text-primary)] mb-2">Knowledge Graph</h2>
        <p className="text-xs text-[var(--eco-text-secondary)] mb-6">
          {stats?.total_suppliers || 0} suppliers · {stats?.total_products || 0} products
        </p>

        {/* Selected Node Details */}
        {selectedNode && (
          <div className="mb-6 p-4 bg-[var(--eco-bg)] rounded-xl border border-[var(--eco-border)]">
            <h3 className="font-semibold text-[var(--eco-text-primary)] mb-3 text-sm">Node Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-[var(--eco-text-secondary)] text-xs">Name</span>
                <p className="font-medium text-[var(--eco-text-primary)]">{selectedNode.label}</p>
              </div>
              <div>
                <span className="text-[var(--eco-text-secondary)] text-xs">Type</span>
                <p className="font-medium text-[var(--eco-text-primary)] capitalize">{selectedNode.type}</p>
              </div>
              {selectedNode.emission && (
                <div>
                  <span className="text-[var(--eco-text-secondary)] text-xs">Emissions</span>
                  <p className="font-medium text-[var(--eco-primary)]">
                    {(selectedNode.emission / 1000).toFixed(2)} t CO₂e
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--eco-text-primary)] mb-2">
            <Filter className="w-4 h-4 inline mr-2" />
            Filter by supplier
          </label>
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--eco-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco-primary)]"
          >
            <option value="all">All suppliers</option>
            {suppliers.map((s, i) => (
              <option key={i} value={s.label}>{s.label}</option>
            ))}
          </select>
        </div>

        <button className="w-full px-4 py-2.5 bg-[var(--eco-primary)] text-white rounded-lg hover:bg-[var(--eco-secondary)] transition-colors flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Export Graph
        </button>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-[var(--eco-border)]">
          <h4 className="text-xs font-semibold text-[var(--eco-text-secondary)] uppercase tracking-wide mb-3">Legend</h4>
          <div className="space-y-2 text-sm">
            {(["supplier", "product", "emission"] as const).map((type) => (
              <div key={type} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getNodeColor(type) }}></div>
                <span className="text-[var(--eco-text-primary)] capitalize">{type}s</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 pt-6 border-t border-[var(--eco-border)]">
          <h4 className="text-xs font-semibold text-[var(--eco-text-secondary)] uppercase tracking-wide mb-3">Graph Stats</h4>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-[var(--eco-bg)] rounded-lg p-2">
              <p className="text-lg font-bold text-[var(--eco-primary)]">{nodes.length}</p>
              <p className="text-xs text-[var(--eco-text-secondary)]">Total Nodes</p>
            </div>
            <div className="bg-[var(--eco-bg)] rounded-lg p-2">
              <p className="text-lg font-bold text-[var(--eco-primary)]">{edges.length}</p>
              <p className="text-xs text-[var(--eco-text-secondary)]">Relationships</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader className="w-10 h-10 animate-spin text-green-400 mx-auto mb-3" />
              <p className="text-green-400 text-sm">Loading knowledge graph...</p>
            </div>
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-green-400 text-xl mb-2">📭 No graph data yet</p>
              <p className="text-gray-400 text-sm">Upload documents from the dashboard to populate the graph</p>
            </div>
          </div>
        ) : (
          <svg className="w-full h-full">
            {/* Edges */}
            {edges.map((edge, i) => {
              const fromNode = filteredNodes.find((n) => n.id === edge.from);
              const toNode = filteredNodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;
              return (
                <g key={i}>
                  <line
                    x1={fromNode.x} y1={fromNode.y}
                    x2={toNode.x} y2={toNode.y}
                    stroke="rgba(26,127,90,0.4)" strokeWidth="2"
                  />
                  <text
                    x={(fromNode.x + toNode.x) / 2}
                    y={(fromNode.y + toNode.y) / 2 - 6}
                    fill="rgba(255,255,255,0.4)"
                    fontSize="9" textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => (
              <g key={node.id} onClick={() => setSelectedNode(node)} className="cursor-pointer">
                <circle
                  cx={node.x} cy={node.y}
                  r={getNodeSize(node.type)}
                  fill={getNodeColor(node.type)}
                  stroke={selectedNode?.id === node.id ? "#fff" : "transparent"}
                  strokeWidth="3"
                  style={{
                    filter: node.type === "emission"
                      ? "drop-shadow(0 0 8px rgba(217,119,6,0.7))"
                      : node.type === "supplier"
                      ? "drop-shadow(0 0 6px rgba(26,127,90,0.5))"
                      : "none"
                  }}
                />
                <text
                  x={node.x} y={node.y + 4}
                  fill="white" fontSize="9"
                  textAnchor="middle" fontWeight="600"
                >
                  {node.label.slice(0, 10)}
                </text>
                <text
                  x={node.x} y={node.y + getNodeSize(node.type) + 16}
                  fill="rgba(255,255,255,0.7)"
                  fontSize="10" textAnchor="middle"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}