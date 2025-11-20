"use client";

import React from "react";
import { showSuccess, showError } from "@/utils/toast";

type ScaleMessage = {
  weight?: number;
  unit?: string;
  status?: string;
  raw?: string;
};

const WS_URL = "ws://localhost:3001";
const BASE_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30_000;
const KEEPALIVE_INTERVAL_MS = 20_000;

const ScaleMonitor: React.FC = () => {
  const [connected, setConnected] = React.useState(false);
  const [weight, setWeight] = React.useState<number | null>(null);
  const [unit, setUnit] = React.useState<string>("kg");
  const [status, setStatus] = React.useState<string>("");
  const [raw, setRaw] = React.useState<string>("");
  const wsRef = React.useRef<WebSocket | null>(null);
  const reconnectAttempt = React.useRef(0);
  const reconnectTimer = React.useRef<number | null>(null);
  const manualDisconnect = React.useRef(false);
  const keepaliveTimer = React.useRef<number | null>(null);

  const clearReconnectTimer = () => {
    if (reconnectTimer.current) {
      window.clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  };

  const clearKeepalive = () => {
    if (keepaliveTimer.current) {
      window.clearInterval(keepaliveTimer.current);
      keepaliveTimer.current = null;
    }
  };

  const scheduleReconnect = () => {
    if (manualDisconnect.current) return;
    reconnectAttempt.current = Math.min(reconnectAttempt.current + 1, 32);
    const delay = Math.min(
      BASE_RECONNECT_DELAY_MS * 2 ** (reconnectAttempt.current - 1),
      MAX_RECONNECT_DELAY_MS,
    );
    clearReconnectTimer();
    reconnectTimer.current = window.setTimeout(() => {
      connect();
    }, delay);
    console.debug(`Reconnecting in ${delay}ms`);
  };

  const startKeepalive = () => {
    clearKeepalive();
    keepaliveTimer.current = window.setInterval(() => {
      try {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ ping: true }));
        }
      } catch (e) {
        // ignore
      }
    }, KEEPALIVE_INTERVAL_MS);
  };

  const stopKeepalive = () => {
    clearKeepalive();
  };

  const connect = () => {
    manualDisconnect.current = false;
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.addEventListener("open", () => {
        reconnectAttempt.current = 0;
        clearReconnectTimer();
        setConnected(true);
        showSuccess("Połączono z backendem (WebSocket)");
        startKeepalive();
      });

      ws.addEventListener("message", (ev) => {
        try {
          const data = JSON.parse(ev.data) as ScaleMessage;
          if (typeof data.weight === "number") {
            setWeight(data.weight);
          }
          if (data.unit) setUnit(data.unit);
          if (data.status) setStatus(data.status);
          if (data.raw) setRaw(data.raw);
        } catch (err) {
          // If message not JSON or doesn't match, set raw
          setRaw(String(ev.data));
        }
      });

      ws.addEventListener("close", () => {
        setConnected(false);
        setStatus("disconnected");
        stopKeepalive();
        if (!manualDisconnect.current) {
          showError("Połączenie WebSocket zamknięte — spróbuję ponownie");
          scheduleReconnect();
        } else {
          showError("Połączenie WebSocket rozłączone ręcznie");
        }
      });

      ws.addEventListener("error", (e) => {
        console.error("WebSocket error", e);
        showError("Błąd WebSocket. Sprawdz backend.");
      });
    } catch (err) {
      console.error(err);
      showError("Nie udało się otworzyć WebSocket");
      scheduleReconnect();
    }
  };

  const disconnect = (manual = true) => {
    manualDisconnect.current = manual;
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        // ignore
      }
      wsRef.current = null;
    }
    clearReconnectTimer();
    stopKeepalive();
    setConnected(false);
    if (manual) showError("Rozłączono ręcznie");
  };

  const sendCommand = (cmd: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      showError("Brak połączenia z backendem");
      return;
    }
    try {
      wsRef.current.send(JSON.stringify({ cmd }));
      showSuccess(`Wysłano komendę: ${cmd}`);
    } catch (e) {
      showError("Nie udało się wysłać komendy");
    }
  };

  // Auto-connect on mount
  React.useEffect(() => {
    connect();
    return () => {
      manualDisconnect.current = true;
      disconnect(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Monitor wagi Rinstrum C320</h2>

      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">Połączenie z backendem (WebSocket)</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              manualDisconnect.current = false;
              connect();
            }}
            disabled={connected}
            className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
          >
            Połącz
          </button>
          <button
            onClick={() => disconnect(true)}
            disabled={!connected}
            className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
          >
            Rozłącz
          </button>
          <div className={`ml-3 inline-block px-2 py-1 rounded ${connected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
            {connected ? "Połączono" : "Rozłączono"}
          </div>
        </div>
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
        <div className="text-sm text-gray-500 mb-2">Sterowanie (wyślij komendę do miernika przez backend)</div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => sendCommand("read_gross")} className="px-3 py-1 bg-blue-600 text-white rounded">Read Gross</button>
          <button onClick={() => sendCommand("read_net")} className="px-3 py-1 bg-blue-500 text-white rounded">Read Net</button>
          <button onClick={() => sendCommand("tare")} className="px-3 py-1 bg-yellow-500 text-white rounded">Tare</button>
          <button onClick={() => sendCommand("zero")} className="px-3 py-1 bg-orange-500 text-white rounded">Zero</button>
        </div>
        <div className="mt-2 text-xs text-gray-500">Uwaga: backend wysyła odpowiednie bajty do NP301.</div>
      </div>

      <div className="mt-6 text-right">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            showSuccess("Interfejs lokalny gotowy. Uruchom Rust backend aby połączyć się z rzeczywistą wagą.");
          }}
          className="text-sm text-gray-600 underline"
        >
          Informacje o połączeniu
        </a>
      </div>
    </div>
  );
};

export default ScaleMonitor;