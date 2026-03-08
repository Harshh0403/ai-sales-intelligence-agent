import { useState, useRef } from "react";
import axios from "axios";
import { API } from "@/App";
import Papa from "papaparse";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Database } from "lucide-react";
import { formatINR } from "@/lib/helpers";

export default function UploadData({ leads, setLeads }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState(null);
  const [loadingSample, setLoadingSample] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        if (!result.data?.length) {
          setMessage({ type: "error", text: "Empty or invalid CSV file" });
          return;
        }
        setPreview(result.data.slice(0, 10));
        setUploading(true);
        setMessage(null);
        try {
          const res = await axios.post(`${API}/upload-json`, { records: result.data });
          setLeads(res.data.leads || []);
          setMessage({ type: "success", text: res.data.message });
        } catch (err) {
          setMessage({ type: "error", text: "Upload failed: " + (err.response?.data?.detail || err.message) });
        } finally {
          setUploading(false);
        }
      },
      error: () => setMessage({ type: "error", text: "Failed to parse CSV file" })
    });
  };

  const loadSample = async () => {
    setLoadingSample(true);
    try {
      const res = await axios.post(`${API}/load-sample`);
      setLeads(res.data.leads || []);
      setPreview(res.data.leads?.slice(0, 10));
      setMessage({ type: "success", text: res.data.message });
    } catch (e) {
      setMessage({ type: "error", text: "Failed to load sample data" });
    } finally {
      setLoadingSample(false);
    }
  };

  const columns = preview?.[0] ? Object.keys(preview[0]) : [];

  return (
    <div className="page-container" data-testid="upload-page">
      <div className="page-header">
        <h1 className="page-title">Upload Data</h1>
        <p className="page-subtitle">Import CRM lead data via CSV for AI analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upload Zone */}
        <div
          className="glass-card p-8 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/40 transition-all min-h-[250px]"
          onClick={() => fileRef.current?.click()}
          data-testid="upload-zone"
        >
          <input type="file" ref={fileRef} accept=".csv" onChange={handleFile} className="hidden" data-testid="csv-file-input" />
          {uploading ? (
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
          ) : (
            <Upload className="w-10 h-10 text-emerald-500/40 mb-4" />
          )}
          <h3 className="text-lg font-semibold text-emerald-100 mb-2">
            {uploading ? "Processing..." : "Upload CSV File"}
          </h3>
          <p className="text-sm text-emerald-500/50 text-center max-w-xs">
            Drag & drop or click to upload your CRM leads dataset. Supports .csv files with headers.
          </p>
        </div>

        {/* Sample Data */}
        <div className="glass-card p-8 flex flex-col items-center justify-center min-h-[250px]">
          <Database className="w-10 h-10 text-emerald-500/40 mb-4" />
          <h3 className="text-lg font-semibold text-emerald-100 mb-2">Load Sample Dataset</h3>
          <p className="text-sm text-emerald-500/50 text-center max-w-xs mb-4">
            Load a pre-built sample dataset with 40 Indian leads across Enjay products for demo purposes.
          </p>
          <button
            data-testid="load-sample-btn"
            onClick={loadSample}
            disabled={loadingSample}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-sm font-medium border border-emerald-500/20 hover:bg-emerald-500/25 transition-all disabled:opacity-50"
          >
            {loadingSample ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            {loadingSample ? "Loading..." : "Load Sample Data"}
          </button>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`glass-card p-4 mb-6 flex items-center gap-3 ${message.type === "error" ? "border-orange-500/30" : "border-emerald-500/30"}`} data-testid="upload-message">
          {message.type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-orange-400" />}
          <span className={`text-sm ${message.type === "success" ? "text-emerald-300" : "text-orange-300"}`}>{message.text}</span>
        </div>
      )}

      {/* Expected Format */}
      <div className="glass-card p-6 mb-6">
        <h3 className="text-sm font-semibold text-emerald-100 mb-3">Expected CSV Format</h3>
        <div className="overflow-x-auto">
          <code className="text-xs text-emerald-400/70 font-mono">
            lead_name, company, industry, interest_level, deal_value_inr, last_contact_date, notes, region, interested_product
          </code>
        </div>
      </div>

      {/* Preview Table */}
      {preview && preview.length > 0 && (
        <div className="glass-card overflow-hidden" data-testid="preview-table">
          <div className="p-4 border-b border-emerald-900/20">
            <h3 className="text-sm font-semibold text-emerald-100">Data Preview (first 10 rows)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-emerald-900/20">
                  {columns.filter(c => c !== "id" && c !== "created_at").map(col => (
                    <th key={col} className="px-3 py-2 text-left text-[9px] uppercase tracking-wider text-emerald-500/60 font-semibold whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-emerald-900/10">
                    {columns.filter(c => c !== "id" && c !== "created_at").map(col => (
                      <td key={col} className="px-3 py-2 text-emerald-100/70 whitespace-nowrap max-w-[200px] truncate">
                        {col === "deal_value_inr" ? formatINR(row[col]) : String(row[col] || "").slice(0, 50)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
