"use client";

import React from "react";
import HistoryChart from "./HistoryChart";
import SettingsPanel from "./SettingsPanel";
import ExportControls from "@/components/ExportControls";
import LogsPanel from "@/components/LogsPanel";
import CommandPanel from "@/components/CommandPanel";
import HealthCheck from "@/components/HealthCheck";
import { showSuccess } from "@/utils/toast";
import type { ScaleMonitorApi } from "./useScaleMonitor";

const ScaleMonitorView: React.FC<{ api: ScaleMonitorApi }> = ({ api }) => {
  const {
    connected,
    weight,
    unit,
    status,
    raw,
    readings,
    logs,
    cmdHistory,
    wsUrl,
    bridgeUrl,
    connect,
    disconnect,
    sendCommand,
    setWsUrl,
    setBridgeUrl,
    clearReadings,
    clearLogs,
    clearCmdHistory,
    continuousActive,
    startContinuousRead,
    stopContinuousRead,
  } = api;

  // ensure continuous read is stopped when connection closes is handled in hook;
  // UI only needs to call start/stop provided by hook.

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold mb-2">Monitor wagi Rinstrum C320</h2>
            <div className="text-xs">
              <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-700">Tryb: Bridge-only</span>
              <span className="ml-2 px-2 py-1 rounded bg-gray-100 text-gray-700">
                Bridge: {bridgeUrl.startsWith("mock://") ? "MOCK" : "REMOTE"}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Połączenie z backendem (WebSocket)</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // ensure manualDisconnect false in hook
                  connect();
                }}
                disabled={connected}
                className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
              >
                Połącz
              </button>
              <button
                onClick={() => {
                  // stop continuous read when explicitly disconnecting
                  stopContinuousRead();
                  disconnect(true);
                }}
                disabled={!connected}
                className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
              >
                Rozłącz
              </button>
              <div
                className={`ml-3 inline-block px-2 py-1 rounded ${
                  connected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {connected ? "Połączono" : "Rozłączono"}
              </div>
            </div>

            {/* Continuous Gross read control placed under the connect/disconnect buttons */}
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  if (!continuousActive) startContinuousRead();
                  else stopContinuousRead();
                }}
                disabled={!connected}
                className={`px-3 py-1 rounded text-sm ${continuousActive ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"} ${!connected ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {continuousActive ? "Stop ciągłego odczytu Gross" : "Start ciągłego odczytu Gross"}
              </button>
              <div className="text-xs text-gray-500">
                {continuousActive ? "Odczyty wysyłane co 1s" : "Brak ciągłego odczytu"}
              </div>
            </div>

            <div className="mt-1 text-xs text-gray-500">Bridge (komendy): {bridgeUrl}</div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Odczyt wagi</div>
            <div className="flex items-baseline gap-4">
              <div className="text-5xl font-mono">{weight !== null ? weight : "--"}</div>
              <div className="text-lg text-gray-600">{unit}</div>
              <div className="ml-4 px-2 py-1 bg-gray-100 rounded text-sm">{status}</div>
            </div>
            <div className="mt-2 text-xs text-gray-500 break-words">Surowe: {raw || "brak"}</div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-2">Sterowanie (komendy wysyłane przez bridge HTTP)</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => sendCommand("20050026:")}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Read Gross
              </button>
              <button onClick={() => sendCommand("read_net")} className="px-3 py-1 bg-blue-500 text-white rounded">
                Read Net
              </button>
              <button onClick={() => sendCommand("tare")} className="px-3 py-1 bg-yellow-500 text-white rounded">
                Tare
              </button>
              <button onClick={() => sendCommand("21120008:0B")} className="px-3 py-1 bg-orange-500 text-white rounded">
                Zero
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Uwaga: komendy trafiają bezpośrednio do bridge'a HTTP (lub do lokalnego mocka jeśli włączony).
            </div>
          </div>

          <div className="mt-6 text-right">
            <ExportControls readings={readings} logs={logs} />
          </div>
        </div>

        <div className="w-80">
          <HealthCheck bridgeUrl={bridgeUrl} />

          <SettingsPanel
            wsUrl={wsUrl}
            onWsChange={(newUrl) => {
              setWsUrl(newUrl);
            }}
            bridgeUrl={bridgeUrl}
            onBridgeChange={(newUrl) => {
              setBridgeUrl(newUrl);
            }}
          />

          <LogsPanel
            logs={logs}
            onClear={() => {
              clearLogs();
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <div>
          <div className="mb-2 text-sm text-gray-500">Historia odczytów</div>
          <HistoryChart readings={readings} />
        </div>

        <div>
          <CommandPanel
            onSend={async (cmd) => {
              await sendCommand(cmd);
            }}
            history={cmdHistory}
            onClear={() => {
              clearCmdHistory();
            }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>Ostatnich punktów: {readings.length}</div>
          <div>
            <button
              onClick={() => {
                clearReadings();
                showSuccess("Wyczyszczono historię odczytów");
              }}
              className="px-2 py-1 bg-gray-200 rounded"
            >
              Wyczyść historię
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScaleMonitorView;