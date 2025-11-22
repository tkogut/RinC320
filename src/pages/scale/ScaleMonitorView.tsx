"use client";

import React from "react";
import HistoryChart from "@/components/HistoryChart";
import SettingsPanel from "./SettingsPanel";
import ExportControls from "@/components/ExportControls";
import LogsPanel from "@/components/LogsPanel";
import CommandPanel from "@/components/CommandPanel";
import HealthCheck from "@/components/HealthCheck";
import { showSuccess } from "@/utils/toast";
import type { ScaleMonitorApi } from "./useScaleMonitor";

const ScaleMonitorView: React.FC<{ api: ScaleMonitorApi }> = ({ api }) => {
  const {
    // removed connect/disconnect usage from UI (still present in hook if needed)
    weight,
    unit,
    status,
    raw,
    readings,
    logs,
    cmdHistory,
    wsUrl,
    bridgeUrl,
    // actions
    sendCommand,
    setWsUrl,
    setBridgeUrl,
    clearReadings,
    clearLogs,
    clearCmdHistory,
    continuousActive,
    startContinuousRead,
    stopContinuousRead,
    continuousAutoEnabled,
    setContinuousAutoEnabled,
  } = api;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold mb-2">Monitor wagi Rinstrum C320</h2>
            {/* Removed mode badges and bridge mode display per request */}
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Połączenie z backendem (WebSocket)</div>

            {/* Continuous read control remains available (no longer gated by WS connection). */}
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  if (!continuousActive) startContinuousRead();
                  else stopContinuousRead();
                }}
                className={`px-3 py-1 rounded text-sm ${continuousActive ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"}`}
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
            continuousAutoEnabled={continuousAutoEnabled}
            onContinuousAutoChange={(v) => {
              setContinuousAutoEnabled(v);
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