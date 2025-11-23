import React from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import MonitorView from "./MonitorView";
import { useAppScaleMonitor } from "@/hooks/useAppScaleMonitor";
import { MadeWithDyad } from "@/components/made-with-dyad";

const MonitorPage = () => {
  const { configId } = useParams<{ configId: string }>();
  const { configurations, hosts } = useAppContext();

  const config = configurations.find(c => c.id === configId);
  const host = hosts.find(h => h.id === config?.hostId);

  const {
    weight, unit, status, raw, readings, logs, cmdHistory, isPolling,
    sendCommand, clearReadings, clearLogs, clearCmdHistory, startPolling, stopPolling,
  } = useAppScaleMonitor(host || null, config?.protocol);

  if (!config || !host) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 text-center">
        <h1 className="text-2xl font-bold">Nie znaleziono konfiguracji</h1>
        <p className="text-gray-600">Nie można znaleźć konfiguracji dla ID: {configId}</p>
        <p className="text-sm mt-4">Upewnij się, że najpierw dodałeś hosta, a następnie konfigurację wagi.</p>
      </div>
    );
  }

  const healthUrl = `/api/health?ip=${host.ipAddress}&port=${host.port}`;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <MonitorView
        scaleName={config.name}
        weight={weight}
        unit={unit}
        status={status}
        raw={raw}
        readings={readings}
        logs={logs}
        cmdHistory={cmdHistory}
        bridgeUrl={`http://${host.ipAddress}:${host.port}`}
        healthUrl={healthUrl}
        isPolling={isPolling}
        onSendCommand={sendCommand}
        onClearReadings={clearReadings}
        onClearLogs={clearLogs}
        onClearCmdHistory={clearCmdHistory}
        onStartPolling={startPolling}
        onStopPolling={stopPolling}
      />
      <footer className="mt-8">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default MonitorPage;