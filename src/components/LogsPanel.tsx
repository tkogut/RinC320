import React from "react";

type LogEntry = {
  ts: number;
  level?: "info" | "warn" | "error";
  message: string;
};

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleTimeString();
};

const levelColor = (level?: LogEntry["level"]) => {
  switch (level) {
    case "error":
      return "text-red-600";
    case "warn":
      return "text-yellow-600";
    default:
      return "text-gray-700";
  }
};

const LogsPanel: React.FC<{
  logs: LogEntry[];
  onClear: () => void;
}> = ({ logs, onClear }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    // auto-scroll to bottom on new log
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const copyToClipboard = async () => {
    const text = logs
      .map((l) => `[${formatTime(l.ts)}] ${l.level ?? "info"}: ${l.message}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  return (
    <div className="mt-4 border rounded bg-white p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Logi (ostatnie {logs.length})</div>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="px-2 py-1 bg-gray-100 rounded text-xs"
          >
            Kopiuj
          </button>
          <button
            onClick={onClear}
            className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
          >
            Wyczyść
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="h-40 overflow-auto text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded"
      >
        {logs.length === 0 ? (
          <div className="text-gray-400">Brak wpisów</div>
        ) : (
          logs.map((l, i) => (
            <div key={i} className="mb-1 break-words">
              <span className="text-gray-400 mr-2">[{formatTime(l.ts)}]</span>
              <span className={`${levelColor(l.level)} mr-2`}>{l.level ?? "info"}</span>
              <span className="">{l.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogsPanel;