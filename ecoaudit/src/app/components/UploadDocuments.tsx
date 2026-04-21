import { useState, useRef } from "react";
import { Upload, FileText, Image as ImageIcon, Mic, CheckCircle, AlertCircle } from "lucide-react";
import { uploadPDF, uploadImage, uploadAudio } from "../api";

type TabType = "pdf" | "image" | "audio";

export function UploadDocuments({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [activeTab, setActiveTab] = useState<TabType>("pdf");
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: "pdf" as TabType, label: "📄 PDF Invoice", icon: FileText },
    { id: "image" as TabType, label: "🖼️ Image Receipt", icon: ImageIcon },
    { id: "audio" as TabType, label: "🎙️ Audio Recording", icon: Mic },
  ];

  const handleFile = async (file: File) => {
    setError("");
    setResult(null);
    setLoading(true);
    setProgress("Uploading file...");

    try {
      setProgress("Processing with AI...");
      let data;
      if (activeTab === "pdf") data = await uploadPDF(file);
      else if (activeTab === "image") data = await uploadImage(file);
      else data = await uploadAudio(file);
      setProgress("Storing in knowledge graph...");
      await new Promise((r) => setTimeout(r, 500));
      setResult(data);
setProgress("");
onUploadSuccess?.();
    } catch (e: any) {
      setError(e?.response?.data?.detail || e.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const acceptMap = {
    pdf: ".pdf",
    image: ".jpg,.jpeg,.png,.webp,.tiff,.bmp",
    audio: ".mp3,.wav,.m4a,.ogg,.flac",
  };

  return (
    <div className="bg-white border border-[var(--eco-border)] rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-[var(--eco-text-primary)] mb-4 flex items-center gap-2">
        <span>📂</span> Upload Documents
      </h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setResult(null); setError(""); }}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[var(--eco-success-bg)] text-[var(--eco-primary)] border-2 border-[var(--eco-primary)]"
                : "bg-[var(--eco-bg)] text-[var(--eco-text-secondary)] border border-[var(--eco-border)] hover:border-[var(--eco-primary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Drop Zone */}
      <input
        ref={inputRef}
        type="file"
        accept={acceptMap[activeTab]}
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
          dragOver
            ? "border-[var(--eco-primary)] bg-[var(--eco-success-bg)]"
            : "border-[var(--eco-border)] bg-[var(--eco-bg)] hover:border-[var(--eco-primary)]"
        }`}
      >
        {loading ? (
          <div>
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-[var(--eco-primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-base font-medium text-[var(--eco-primary)]">{progress}</p>
            <p className="text-sm text-[var(--eco-text-secondary)] mt-1">Please wait...</p>
          </div>
        ) : (
          <div>
            <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--eco-text-secondary)]" />
            <p className="text-base text-[var(--eco-text-primary)] mb-2">Drop your file here</p>
            <p className="text-sm text-[var(--eco-text-secondary)] mb-1">
              or{" "}
              <span className="text-[var(--eco-primary)] font-medium">browse to upload</span>
            </p>
            <p className="text-xs text-[var(--eco-text-secondary)] mt-3">
              {activeTab === "pdf" && "Accepted: PDF"}
              {activeTab === "image" && "Accepted: JPG, PNG, WEBP"}
              {activeTab === "audio" && "Accepted: MP3, WAV, M4A"}
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="mt-4 p-4 bg-[var(--eco-success-bg)] rounded-lg border border-[var(--eco-primary)]">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-[var(--eco-primary)]" />
            <p className="text-sm font-semibold text-[var(--eco-primary)]">{result.message}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-white rounded-lg p-3 border border-[var(--eco-border)]">
              <p className="text-xs text-[var(--eco-text-secondary)]">Records extracted</p>
              <p className="text-xl font-bold text-[var(--eco-primary)]">
                {result.emission_records?.length || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-[var(--eco-border)]">
              <p className="text-xs text-[var(--eco-text-secondary)]">Graph nodes created</p>
              <p className="text-xl font-bold text-[var(--eco-primary)]">
                {result.graph_nodes_created || 0}
              </p>
            </div>
          </div>
          {result.extracted_text && (
            <details className="mt-2">
              <summary className="text-xs text-[var(--eco-text-secondary)] cursor-pointer">
                View extracted text
              </summary>
              <p className="text-xs mt-1 p-2 bg-white rounded border text-gray-600 whitespace-pre-wrap">
                {result.extracted_text}
              </p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}