import { useState } from "react";
import { Send, ChevronDown, ChevronUp, Loader } from "lucide-react";
import { queryGraph } from "../api";

export function AskSupplyChain() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [showCypher, setShowCypher] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const suggestions = [
    "Which supplier has highest emissions?",
    "List all steel products",
    "Total emissions from all suppliers",
    "Show CBAM liability by supplier",
  ];

  const handleAsk = async (q?: string) => {
    const question = q || query;
    if (!question.trim()) return;
    setQuery(question);
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await queryGraph(question);
      setResult(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Query failed. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[var(--eco-border)] rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-[var(--eco-text-primary)] mb-4 flex items-center gap-2">
        <span>🔍</span> Ask Your Supply Chain
      </h3>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="Ask anything… e.g. Total emissions from ABC Steel"
          className="flex-1 px-4 py-2.5 border border-[var(--eco-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco-primary)] focus:border-transparent"
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading}
          className="px-6 py-2.5 bg-[var(--eco-primary)] text-white rounded-lg hover:bg-[var(--eco-secondary)] transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <><span>Ask</span><Send className="w-4 h-4" /></>}
        </button>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => handleAsk(s)}
            className="px-3 py-1.5 bg-[var(--eco-success-bg)] text-[var(--eco-primary)] rounded-full text-xs font-medium hover:bg-[var(--eco-primary)] hover:text-white transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-3">
          ⚠️ {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-3">
          {/* Answer */}
          <div className="p-4 bg-[var(--eco-success-bg)] rounded-lg border-l-4 border-[var(--eco-primary)]">
            <p className="text-xs font-semibold text-[var(--eco-primary)] uppercase tracking-wide mb-2">
              Answer
            </p>
            <p className="text-sm text-[var(--eco-text-primary)] leading-relaxed">
              {result.answer}
            </p>
          </div>

          {/* Cypher toggle */}
          <button
            onClick={() => setShowCypher(!showCypher)}
            className="flex items-center gap-2 text-sm text-[var(--eco-primary)] hover:text-[var(--eco-secondary)]"
          >
            {showCypher ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            View generated Cypher query
          </button>

          {showCypher && (
            <div className="p-4 bg-gray-900 rounded-lg">
              <pre className="text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">
                {result.cypher_query}
              </pre>
            </div>
          )}

          {/* Raw results */}
          {result.raw_results?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--eco-primary)] text-white">
                    {Object.keys(result.raw_results[0]).map((k) => (
                      <th key={k} className="px-3 py-2 text-left font-medium">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.raw_results.slice(0, 10).map((row: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      {Object.values(row).map((v: any, j) => (
                        <td key={j} className="px-3 py-2 text-[var(--eco-text-primary)]">
                          {typeof v === "number" ? v.toLocaleString() : String(v ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* New question */}
          <button
            onClick={() => { setResult(null); setQuery(""); }}
            className="text-xs text-[var(--eco-primary)] font-medium hover:underline"
          >
            ← Ask another question
          </button>
        </div>
      )}
    </div>
  );
}