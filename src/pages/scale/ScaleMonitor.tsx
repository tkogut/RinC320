"use client";

import React from "react";
import { showSuccess, showError } from "@/utils/toast";

type ScaleMessage = {
  weight: number;
  unit: string;
  status: string;
  raw: string;
};

const WS_URL = "ws://localhost:3001";

const ScaleMonitor: React.FC = () => {
  const [connected, setConnected] = React.useState(false);
  const [weight, setWeight] = React.useState<number | null>(null);
  const [unit, setUnit] = React.useState<string>("kg");
  const [status, setStatus] = React.useState<string>("");
  const [raw, setRaw] = React.useState<string>("");
  const wsRef = React.useRef<WebSocket | null>(null);

  const connect = () => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      showError("WebSocket już łączy lub jest otwarty");
      return;
    }

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.addEventListener("open", () => {
        setConnected(true);
        showSuccess("Połączono z backendem (WebSocket)");
      });

      ws.addEventListener("message", (ev) => {
        try {
          const data = JSON.parse(ev.data) as ScaleMessage;
          setWeight(data.weight);
          setUnit(data.unit || "kg");
          setStatus(data.status || "");
          setRaw(data.raw || "");
        } catch (err) {
          console.error("Nieudane parsowanie wiadomości WS:", ev.data);
        }
      });

      ws.addEventListener("close", () => {
        setConnected(false);
        showError("Połączenie WebSocket zamknięte");
      });

      ws.addEventListener("error", (e) => {
        console.error("WebSocket error", e);
        showError("Błąd WebSocket. Sprawdź backend.");
      });
    } catch (err) {
      console.error(err);
      showError("Nie udało się otworzyć WebSocket");
    }
  };

  const disconnect = () => {
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
    showError("Rozłączono");
  };

  const sendCommand = (cmd: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      showError("Brak połączenia z backendem");
      return;
    }
    wsRef.current.send(JSON.stringify({ cmd }));
    showSuccess(`Wysłano komendę: ${cmd}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Monitor wagi Rinstrum C320</h2>

      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">Połączenie z backendem (WebSocket)</div>
        <div className="flex items-center gap-2">
          <button
            onClick={connect}
            disabled={connected}
            className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
          >
            Połącz
          </button>
          <button
            onClick={disconnect}
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
        <div className="mt-2 text-xs text-gray-500">Surowe: {raw || "brak"}</div>
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