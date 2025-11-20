import React from "react";

type Reading = {
  ts: number;
  weight: number | null;
};

type LogEntry = {
  ts: number;
  level?: "info" | "warn" | "error";
  message: string;
};

const download = (filename: string, data: Blob) => {
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const toCsv = (readings: Reading[]) => {
  const lines = [["timestamp", "iso", "weight"]];
  for (const r of readings) {
    const iso = new Date(r.ts).toISOString();
    lines.push([String(r.ts), iso, r.weight !== null ? String(r.weight) : ""]);
  }
  return lines.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
};

const logsToText = (logs: LogEntry[]) =>
  logs.map((l) => `[${new Date(l.ts).toISOString()}] ${l.level ?? "info"}: ${l.message}`).join("\n");

const ExportControls: React.FC<{
  readings: Reading[];
  logs: LogEntry[];
}> = ({ readings, logs }) => {
  const exportCsv = () => {
    const csv = toCsv(readings);
    download("readings.csv", new Blob([csv], { type: "text/csv;charset=utf-8" }));
  };

  const exportLatestJson = () => {
    const last = readings.length > 0 ? readings[readings.length - 1] : null;
    const data = JSON.stringify(last, null, 2);
    download("last-reading.json", new Blob([data], { type: "application/json" }));
  };

  const exportLogs = () => {
    const text = logsToText(logs);
    download("logs.txt", new Blob([text], { type: "text/plain;charset=utf-8" }));
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportCsv}
        className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
        disabled={readings.length === 0}
      >
        Eksportuj CSV
      </button>
      <button
        onClick={exportLatestJson}
        className="px-3 py-1 bg-gray-700 text-white rounded text-sm"
        disabled={readings.length === 0}
      >
        Pobierz ostatni JSON
      </button>
      <button
        onClick={exportLogs}
        className="px-3 py-1 bg-gray-200 rounded text-sm"
        disabled={logs.length === 0}
      >
        Pobierz logi
      </button>
    </div>
  );
};

export default ExportControls;