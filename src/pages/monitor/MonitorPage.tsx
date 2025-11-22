import { useParams } from "react-router-dom";
import MonitorView from "./MonitorView";
import { useState } from "react";
import type { Reading, LogEntry, CmdEntry } from "@/types";

// This is a temporary mock store for demonstration purposes.
// In a real app, this would come from a global state manager or an API call.
const MOCK_CONFIGS = {
  "waga-magazynowa-1": {
    id: "waga-magazynowa-1",
    name: "Waga Magazynowa 1",
    bridgeUrl: "/api/rincmd", // Using the vite proxy
  },
};

const MonitorPage = () => {
  const { configId } = useParams<{ configId: string }>();
  const config = configId ? MOCK_CONFIGS[configId] : null;

  // Mock state for the monitor view
  const [weight, setWeight] = useState<number | null>(123.45);
  const [readings, setReadings] = useState<Reading[]>([
    { ts: Date.now() - 2000, weight: 123.40 },
    { ts: Date.now() - 1000, weight: 123.42 },
    { ts: Date.now(), weight: 123.45 },
  ]);
  const [logs, setLogs] = useState<LogEntry[]>([
    { ts: Date.now(), level: "info", message: "Monitor page initialized (mock data)." }
  ]);
  const [cmdHistory, setCmdHistory] = useState<CmdEntry[]>([]);

  if (!config) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 text-center">
        <h1 className="text-2xl font-bold">Nie znaleziono konfiguracji</h1>
        <p className="text-gray-600">Nie można znaleźć konfiguracji dla ID: {configId}</p>
      </div>
    );
  }

  const handleSendCommand = async (cmd: string) => {
    // Mock implementation
    const ts = Date.now();
    setCmdHistory(prev => [...prev, { ts, cmd, status: "sent" }]);
    setLogs(prev => [...prev, { ts, level: "info", message: `Sending command: ${cmd}` }]);
    
    await new Promise(res => setTimeout(res, 300));

    const isReadCmd = cmd.toLowerCase().includes("read");
    const newWeight = isReadCmd ? (Math.random() * 100 + 50) : weight;
    const resp = isReadCmd ? `OK: ${newWeight.toFixed(2)} kg` : "OK";

    setCmdHistory(prev => prev.map(c => c.ts === ts ? { ...c, status: "ok", resp } : c));
    if (isReadCmd) {
      setWeight(newWeight);
      setReadings(prev => [...prev, { ts: Date.now(), weight: newWeight }]);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <MonitorView
        scaleName={config.name}
        weight={weight}
        unit="kg"
        status="Stabilna"
        raw="ST,GS,   123.45,kg"
        readings={readings}
        logs={logs}
        cmdHistory={cmdHistory}
        bridgeUrl={config.bridgeUrl}
        onSendCommand={handleSendCommand}
        onClearReadings={() => setReadings([])}
        onClearLogs={() => setLogs([])}
        onClearCmdHistory={() => setCmdHistory([])}
      />
    </div>
  );
};

export default MonitorPage;