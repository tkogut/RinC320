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

// Props for the generic view
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
  onSendCommand: (cmd: string) => Promise<void>;
  onClearReadings: () => void;
  onClearLogs: () => void;
  onClearCmdHistory: () => void;
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
  onSendCommand,
  onClearReadings,
  onClearLogs,
  onClearCmdHistory,
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
            {/* Main Display */}
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="text-sm text-gray-500 mb-1">Aktualny Odczyt</div>
              <div className="flex items-baseline gap-4">
                <div className="text-6xl font-mono">{weight !== null ? weight.toFixed(2) : "--"}</div>
                <div className="text-2xl text-gray-600">{unit}</div>
                <div className="ml-auto px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">{status}</div>
              </div>
              <div className="mt-2 text-xs text-gray-500 break-words">Surowe dane: {raw || "brak"}</div>
            </div>

            {/* History Chart */}
            <div>
              <div className="mb-2 text-sm font-medium text-gray-700">Historia odczytów ({readings.length})</div>
              <HistoryChart readings={readings} />
              <div className="text-right mt-2">
                <Button variant="outline" size="sm" onClick={() => {
                  onClearReadings();
                  showSuccess("Wyczyszczono historię odczytów");
                }}>
                  Wyczyść historię
                </Button>
              </div>
            </div>

            {/* Command Panel */}
            <CommandPanel
              onSend={onSendCommand}
              history={cmdHistory}
              onClear={onClearCmdHistory}
            />
          </div>

          <div className="space-y-6">
            <HealthCheck bridgeUrl={bridgeUrl} />
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