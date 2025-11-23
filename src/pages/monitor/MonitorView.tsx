"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import HistoryChart from "@/components/HistoryChart";
import ExportControls from "@/components/ExportControls";
import LogsPanel from "@/components/LogsPanel";
import CommandPanel from "@/components/CommandPanel";
import HealthCheck from "@/components/HealthCheck";
import { showSuccess } from "@/utils/toast";
import type { Reading, LogEntry, CmdEntry } from "@/types";
import { Play, Square } from "lucide-react";

type MonitorViewProps = {
  scaleName: string;
  weight: number | null;
  unit: string;
  status: string;
  raw: string;
  readings: Reading[];
  logs: LogEntry[];
  cmdHistory: CmdEntry[];
  bridgeUrl: string;
  healthUrl?: string;
  isPolling: boolean;
  onSendCommand: (cmd: string) => Promise<void>;
  onClearReadings: () => void;
  onClearLogs: () => void;
  onClearCmdHistory: () => void;
  onStartPolling: () => void;
  onStopPolling: () => void;
};

const MonitorView: React.FC<MonitorViewProps> = ({
  scaleName,
  weight,
  unit,
  status,
  raw,
  readings,
  logs,
  cmdHistory,
  bridgeUrl,
  healthUrl,
  isPolling,
  onSendCommand,
  onClearReadings,
  onClearLogs,
  onClearCmdHistory,
  onStartPolling,
  onStopPolling,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Monitor Wagi: {scaleName}</h1>
        <p className="text-gray-600">
          Odczyty na żywo i narzędzia diagnostyczne.
        </p>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Aktualny Odczyt</div>
                  <div className="flex items-baseline gap-4">
                    <div className="text-6xl font-mono">{weight !== null ? weight.toFixed(2) : "--"}</div>
                    <div className="text-2xl text-gray-600">{unit}</div>
                    <div className="ml-auto px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">{status}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Button onClick={isPolling ? onStopPolling : onStartPolling} variant={isPolling ? "destructive" : "default"} size="sm">
                    {isPolling ? <Square className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    {isPolling ? "Zatrzymaj" : "Rozpocznij"}
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    {isPolling ? "Odczyt co 1s" : "Ciągły odczyt"}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 break-words">Surowe dane: {raw || "brak"}</div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow">
              <div className="text-sm font-medium text-gray-700 mb-3">Szybkie akcje</div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => onSendCommand("TARE")}>Taruj</Button>
                <Button onClick={() => onSendCommand("ZERO")}>Zeruj</Button>
                <Button variant="secondary" onClick={() => onSendCommand("READ")}>Odczyt jednorazowy</Button>
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-gray-700">Historia odczytów ({readings.length})</div>
              <HistoryChart readings={readings} />
              <div className="text-right mt-2">
                <Button variant="outline" size="sm" onClick={() => { onClearReadings(); showSuccess("Wyczyszczono historię odczytów"); }}>
                  Wyczyść historię
                </Button>
              </div>
            </div>

            <CommandPanel onSend={onSendCommand} history={cmdHistory} onClear={onClearCmdHistory} />
          </div>

          <div className="space-y-6">
            <HealthCheck bridgeUrl={bridgeUrl} healthUrl={healthUrl} />
            <LogsPanel logs={logs} onClear={onClearLogs} />
            <div className="p-4 border rounded bg-white">
              <div className="text-sm font-medium mb-2">Eksport Danych</div>
              <ExportControls readings={readings} logs={logs} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MonitorView;