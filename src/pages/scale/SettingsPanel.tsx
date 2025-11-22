"use client";

import React from "react";

type Props = {
  wsUrl: string;
  onWsChange: (newUrl: string) => void;
  bridgeUrl: string;
  onBridgeChange: (newUrl: string) => void;
  continuousAutoEnabled: boolean;
  onContinuousAutoChange: (v: boolean) => void;
};

const STORAGE_KEY = "scale_ws_url";
const BRIDGE_STORAGE_KEY = "scale_bridge_url";
const BRIDGE_MOCK_KEY = "scale_bridge_mock";
const CONTINUOUS_AUTO_KEY = "scale_continuous_auto";

const SettingsPanel: React.FC<Props> = ({ wsUrl, onWsChange, bridgeUrl, onBridgeChange, continuousAutoEnabled, onContinuousAutoChange }) => {
  const [open, setOpen] = React.useState(false);
  const [wsValue, setWsValue] = React.useState(wsUrl);
  const [bridgeValue, setBridgeValue] = React.useState(bridgeUrl);
  const [useMock, setUseMock] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem(BRIDGE_MOCK_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [useContinuousAuto, setUseContinuousAuto] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem(CONTINUOUS_AUTO_KEY) === "1";
    } catch {
      return continuousAutoEnabled;
    }
  });

  React.useEffect(() => {
    setWsValue(wsUrl);
  }, [wsUrl]);

  React.useEffect(() => {
    setBridgeValue(bridgeUrl);
  }, [bridgeUrl]);

  React.useEffect(() => {
    setUseContinuousAuto(continuousAutoEnabled);
  }, [continuousAutoEnabled]);

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, wsValue);
    } catch (e) {
      // ignore
    }
    try {
      localStorage.setItem(BRIDGE_STORAGE_KEY, bridgeValue);
    } catch (e) {
      // ignore
    }
    try {
      localStorage.setItem(CONTINUOUS_AUTO_KEY, useContinuousAuto ? "1" : "0");
    } catch {}
    onWsChange(wsValue);
    onBridgeChange(bridgeValue);
    onContinuousAutoChange(useContinuousAuto);
    setOpen(false);
  };

  const restoreFromStorage = () => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v) {
        setWsValue(v);
        onWsChange(v);
      }
    } catch (e) {
      // ignore
    }
    try {
      const b = localStorage.getItem(BRIDGE_STORAGE_KEY);
      if (b) {
        setBridgeValue(b);
        onBridgeChange(b);
      }
    } catch (e) {
      // ignore
    }
    try {
      const c = localStorage.getItem(CONTINUOUS_AUTO_KEY);
      if (c) {
        const enabled = c === "1";
        setUseContinuousAuto(enabled);
        onContinuousAutoChange(enabled);
      }
    } catch {}
    setOpen(false);
  };

  const toggleMock = (val: boolean) => {
    setUseMock(val);
    try {
      localStorage.setItem(BRIDGE_MOCK_KEY, val ? "1" : "0");
    } catch {}
    if (val) {
      // when enabling mock set a special bridge URL scheme
      const mockUrl = "mock://local";
      setBridgeValue(mockUrl);
      onBridgeChange(mockUrl);
    } else {
      // when disabling, restore previously saved or default
      try {
        const saved = localStorage.getItem(BRIDGE_STORAGE_KEY) || "http://localhost:8080/rincmd";
        setBridgeValue(saved);
        onBridgeChange(saved);
      } catch {
        setBridgeValue("http://localhost:8080/rincmd");
        onBridgeChange("http://localhost:8080/rincmd");
      }
    }
  };

  return (
    <div className="mt-4 p-3 border rounded bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Ustawienia połączenia</div>
        <button
          className="text-sm text-blue-600 underline"
          onClick={() => setOpen((s) => !s)}
        >
          {open ? "Zamknij" : "Edytuj"}
        </button>
      </div>

      {open ? (
        <div className="mt-3 space-y-2">
          <div>
            <label className="block text-xs text-gray-600">WebSocket URL</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={wsValue}
              onChange={(e) => setWsValue(e.target.value)}
              placeholder="ws://localhost:3001"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600">Bridge (HTTP POST) URL</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={bridgeValue}
              onChange={(e) => {
                setBridgeValue(e.target.value);
                // if user types a custom URL, disable mock
                if (useMock) {
                  toggleMock(false);
                }
              }}
              placeholder="http://localhost:8080/rincmd"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="mock-bridge"
              type="checkbox"
              checked={useMock}
              onChange={(e) => toggleMock(e.target.checked)}
            />
            <label htmlFor="mock-bridge" className="text-xs text-gray-600">Użyj mock bridge (frontend)</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="auto-continuous"
              type="checkbox"
              checked={useContinuousAuto}
              onChange={(e) => setUseContinuousAuto(e.target.checked)}
            />
            <label htmlFor="auto-continuous" className="text-xs text-gray-600">Auto-start ciągłego odczytu przy starcie</label>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={restoreFromStorage}
              className="px-3 py-1 bg-gray-200 rounded text-sm"
            >
              Przywróć z pamięci
            </button>
            <button
              onClick={() => {
                setWsValue(wsUrl);
                setBridgeValue(bridgeUrl);
                setUseContinuousAuto(continuousAutoEnabled);
                setOpen(false);
              }}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Anuluj
            </button>
            <button
              onClick={save}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm"
            >
              Zapisz
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 text-sm text-gray-600">
          <div>Aktualny WS: {wsUrl}</div>
          <div className="mt-1">Bridge: {bridgeUrl}</div>
          <div className="mt-1">Auto-start ciągłego odczytu: {useContinuousAuto ? "Tak" : "Nie"}</div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;