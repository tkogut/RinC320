"use client";

import React from "react";
import { showSuccess, showError } from "@/utils/toast";

type ScaleMessage = {
  weight?: number;
  unit?: string;
  status?: string;
  raw?: string;
};

const DEFAULT_WS = "ws://localhost:3001";
const DEFAULT_BRIDGE = "http://localhost:8080/rincmd";
const STORAGE_KEY = "scale_ws_url";
const BRIDGE_STORAGE_KEY = "scale_bridge_url";
const BASE_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30_000;
const KEEPALIVE_INTERVAL_MS = 20_000;
const HISTORY_LIMIT = 200;
const LOG_LIMIT = 500;
const CMD_HISTORY_LIMIT = 100;

export type LogEntry = {
  ts: number;
  level?: "info" | "warn" | "error";
  message: string;
};

export type CmdEntry = {
  ts: number;
  cmd: string;
  status: "sent" | "ok" | "error";
  resp?: string;
};

export type Reading = { ts: number; weight: number | null };

export type ScaleMonitorApi = {
  // state
  connected: boolean;
  weight: number | null;
  unit: string;
  status: string;
  raw: string;
  readings: Reading[];
  logs: LogEntry[];
  cmdHistory: CmdEntry[];
  wsUrl: string;
  bridgeUrl: string;
  // actions
  setWsUrl: (s: string) => void;
  setBridgeUrl: (s: string) => void;
  connect: () => void;
  disconnect: (manual?: boolean) => void;
  sendCommand: (cmd: string) => Promise<void>;
  clearReadings: () => void;
  clearLogs: () => void;
  clearCmdHistory: () => void;
};

export function useScaleMonitor(): ScaleMonitorApi {
  const [connected, setConnected] = React.useState(false);
  const [weight, setWeight] = React.useState<number | null>(null);
  const [unit, setUnit] = React.useState<string>("kg");
  const [status, setStatus] = React.useState<string>("");
  const [raw, setRaw] = React.useState<string>("");
  const [readings, setReadings] = React.useState<Reading[]>([]);
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [cmdHistory, setCmdHistory] = React.useState<CmdEntry[]>([]);

  const wsRef = React.useRef<WebSocket | null>(null);
  const reconnectAttempt = React.useRef(0);
  const reconnectTimer = React.useRef<number | null>(null);
  const manualDisconnect = React.useRef(false);
  const keepaliveTimer = React.useRef<number | null>(null);

  const [wsUrl, setWsUrlState] = React.useState<string>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v || DEFAULT_WS;
    } catch {
      return DEFAULT_WS;
    }
  });

  const [bridgeUrl, setBridgeUrlState] = React.useState<string>(() => {
    try {
      const v = localStorage.getItem(BRIDGE_STORAGE_KEY);
      return v || DEFAULT_BRIDGE;
    } catch {
      return DEFAULT_BRIDGE;
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, wsUrl);
    } catch {
      // ignore
    }
  }, [wsUrl]);

  React.useEffect(() => {
    try {
      localStorage.setItem(BRIDGE_STORAGE_KEY, bridgeUrl);
    } catch {
      // ignore
    }
  }, [bridgeUrl]);

  const addLog = (level: LogEntry["level"], message: string) => {
    setLogs((prev) => {
      const next = [...prev, { ts: Date.now(), level, message }];
      if (next.length > LOG_LIMIT) {
        next.splice(0, next.length - LOG_LIMIT);
      }
      return next;
    });
  };

  const addCmd = (entry: CmdEntry) => {
    setCmdHistory((prev) => {
      const next = [...prev, entry];
      if (next.length > CMD_HISTORY_LIMIT) next.splice(0, next.length - CMD_HISTORY_LIMIT);
      return next;
    });
  };

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
    addLog("info", `Ponowne łączenie za ${delay}ms`);
    console.debug(`Reconnecting in ${delay}ms`);
  };

  const startKeepalive = () => {
    clearKeepalive();
    keepaliveTimer.current = window.setInterval(() => {
      try {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ ping: true }));
          addLog("info", "Wysłano ping keepalive");
        }
      } catch {
        // ignore
      }
    }, KEEPALIVE_INTERVAL_MS);
  };

  const stopKeepalive = () => {
    clearKeepalive();
  };

  const pushReading = (w: number | null) => {
    setReadings((prev) => {
      const next = [...prev, { ts: Date.now(), weight: w }];
      if (next.length > HISTORY_LIMIT) {
        next.shift();
      }
      return next;
    });
  };

  /**
   * Improved weight extraction:
   * 1) Prefer a numeric token that has an explicit unit (kg/g/lb/lbs/oz).
   *    This now accepts optional whitespace between sign and digits (e.g. "- 23 kg").
   * 2) If none, try to find a number after a ':' (common "register: value" responses),
   *    and accept forms like ":- 23" or ": -23".
   * 3) Otherwise, fall back to the last numeric token in the string (so register prefixes at the start are ignored).
   */
  const extractWeightFromString = (s?: string | null) => {
    if (!s) return null;
    const str = String(s);

    // Regex to capture a numeric token possibly with a sign (allowing whitespace after sign),
    // and an optional unit immediately after.
    const tokenRe = /([+-]?\s*\d+(?:[.,]\d+)?)(?:\s*(kg|g|lb|lbs|oz))?/gi;

    let match: RegExpExecArray | null;
    const numericTokens: Array<{ raw: string; unit?: string; index: number }> = [];
    const withUnitTokens: Array<{ raw: string; unit: string; index: number }> = [];

    while ((match = tokenRe.exec(str)) !== null) {
      const rawNum = match[1];
      const unit = match[2]?.toLowerCase();
      const idx = match.index;
      if (unit) {
        withUnitTokens.push({ raw: rawNum, unit, index: idx });
      } else {
        numericTokens.push({ raw: rawNum, index: idx });
      }
    }

    // 1) If we found any token with explicit unit, prefer the one that appears latest (in case multiple)
    if (withUnitTokens.length > 0) {
      const chosen = withUnitTokens[withUnitTokens.length - 1];
      // remove internal spaces so "- 23" becomes "-23"
      const cleaned = chosen.raw.replace(/\s+/g, "");
      const num = parseFloat(cleaned.replace(",", "."));
      if (isNaN(num)) return null;
      let unitFound = chosen.unit;
      let finalNum = num;
      if (unitFound === "g") {
        finalNum = finalNum / 1000;
        unitFound = "kg";
      }
      return { num: finalNum, unit: unitFound };
    }

    // 2) Try to find a number that occurs after a colon ":" (common format "81050026: 55 kg G" or "81050026:- 23 kg G")
    const colonRe = /:\s*([+-]?)\s*([0-9]+(?:[.,][0-9]+)?)/;
    const colonMatch = str.match(colonRe);
    if (colonMatch && colonMatch[2]) {
      const signPart = colonMatch[1] || "";
      const numPart = colonMatch[2];
      const rawNum = `${signPart}${numPart}`.replace(",", ".");
      const num = parseFloat(rawNum);
      if (!isNaN(num)) {
        // attempt to find unit after the number (small window)
        const colonIndex = colonMatch.index ?? str.indexOf(":");
        const afterStart = colonIndex + (colonMatch[0]?.length ?? 0);
        // But to be safe, search for unit after the colon occurrence:
        const afterStr = str.slice(colonIndex + 1, colonIndex + 1 + 40);
        const unitMatch = afterStr.match(/\b(kg|g|lb|lbs|oz)\b/i);
        let unitFound = unitMatch ? unitMatch[1].toLowerCase() : "kg";
        let finalNum = num;
        if (unitFound === "g") {
          finalNum = finalNum / 1000;
          unitFound = "kg";
        }
        return { num: finalNum, unit: unitFound };
      }
    }

    // 3) Fallback: pick the last numeric token we found (ignores early register prefix)
    if (numericTokens.length > 0) {
      const last = numericTokens[numericTokens.length - 1];
      const cleaned = last.raw.replace(/\s+/g, "");
      const num = parseFloat(cleaned.replace(",", "."));
      if (isNaN(num)) return null;
      // no explicit unit found; default to kg
      return { num, unit: "kg" };
    }

    return null;
  };

  const connect = () => {
    manualDisconnect.current = false;
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      addLog("warn", "WebSocket już łączy lub jest otwarty");
      return;
    }

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      addLog("info", `Tworzę połączenie WS -> ${wsUrl}`);

      ws.addEventListener("open", () => {
        reconnectAttempt.current = 0;
        clearReconnectTimer();
        setConnected(true);
        showSuccess("Połączono z backendem (WebSocket)");
        addLog("info", "Połączono z backendem (open)");
        startKeepalive();
      });

      ws.addEventListener("message", (ev) => {
        try {
          const data = JSON.parse(ev.data) as ScaleMessage;
          if (typeof data.weight === "number") {
            setWeight(data.weight);
            pushReading(data.weight);
            addLog("info", `Otrzymano wagę: ${data.weight} ${data.unit ?? ""}`);
          } else {
            pushReading(null);
            addLog("info", `Otrzymano nie-metryczny komunikat: ${String(ev.data).slice(0, 200)}`);
          }
          if (data.unit) setUnit(data.unit);
          if (data.status) setStatus(data.status);
          if (data.raw) setRaw(data.raw);
        } catch (err) {
          const text = String(ev.data);
          setRaw(text);
          pushReading(null);
          addLog("warn", `Nieparsowalna wiadomość WS: ${text.slice(0, 200)}`);
        }
      });

      ws.addEventListener("close", () => {
        setConnected(false);
        setStatus("disconnected");
        stopKeepalive();
        addLog("warn", "Połączenie WebSocket zamknięte");
        if (!manualDisconnect.current) {
          showError("Połączenie WebSocket zamknięte — spróbuję ponownie");
          scheduleReconnect();
        } else {
          showError("Połączenie WebSocket rozłączone ręcznie");
        }
      });

      ws.addEventListener("error", (e) => {
        console.error("WebSocket error", e);
        addLog("error", `WebSocket error: ${String(e)}`);
        showError("Błąd WebSocket. Sprawdź backend.");
      });
    } catch (err) {
      console.error(err);
      addLog("error", `Nie udało się otworzyć WebSocket: ${String(err)}`);
      showError("Nie udało się otworzyć WebSocket");
      scheduleReconnect();
    }
  };

  const disconnect = (manual = true) => {
    manualDisconnect.current = manual;
    if (wsRef.current) {
      try {
        wsRef.current.close();
        addLog("info", "Zamykam połączenie WebSocket (close)");
      } catch {
        addLog("warn", "Błąd przy zamykaniu WebSocket");
      }
      wsRef.current = null;
    }
    clearReconnectTimer();
    stopKeepalive();
    setConnected(false);
    if (manual) showError("Rozłączono ręcznie");
  };

  const sendCommand = async (cmd: string) => {
    const entryBase: CmdEntry = { ts: Date.now(), cmd, status: "sent" };
    addCmd(entryBase);

    if (bridgeUrl.startsWith("mock://")) {
      addLog("info", `Mock bridge: symuluję wysłanie komendy: ${cmd}`);
      try {
        await new Promise((res) => setTimeout(res, 400));
        let respObj: any = { success: true, command: cmd, timestamp: new Date().toISOString() };
        if (/read/i.test(cmd) || /20050026:/.test(cmd)) {
          respObj.response = `810${Math.floor(Math.random() * 900000)}: ${(Math.random() * 10 + 1).toFixed(2)} kg G`;
        } else if (/21120008:0B/.test(cmd)) {
          respObj.response = `81120008:0000`;
        } else {
          respObj.response = `OK: ${cmd}`;
        }
        addCmd({ ...entryBase, status: "ok", resp: JSON.stringify(respObj) });
        addLog("info", `Mock bridge odpowiedział: ${JSON.stringify(respObj)}`);

        const parsed = extractWeightFromString(respObj.response);
        if (parsed) {
          setWeight(parsed.num);
          setUnit(parsed.unit);
          pushReading(parsed.num);
          addLog("info", `Zaktualizowano wagę z mock response: ${parsed.num} ${parsed.unit}`);
          showSuccess(`Odczyt: ${parsed.num} ${parsed.unit}`);
        } else {
          showSuccess(`Mock: ${cmd}`);
        }
        return;
      } catch (e) {
        addCmd({ ...entryBase, status: "error", resp: String(e) });
        addLog("error", `Mock bridge błąd: ${String(e)}`);
        showError("Mock bridge error");
        return;
      }
    }

    try {
      addLog("info", `Wysyłam komendę przez bridge: ${cmd} -> ${bridgeUrl}`);
      const res = await fetch(bridgeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command: cmd }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        addCmd({ ...entryBase, status: "error", resp: `HTTP ${res.status}: ${text}` });
        addLog("error", `Bridge zwrócił błąd ${res.status}: ${text}`);
        showError(`Bridge error: ${res.status}`);
        return;
      }

      let body: any = null;
      let rawText: string | null = null;
      try {
        body = await res.json().catch(() => null);
      } catch {
        body = null;
      }
      if (body) {
        rawText = JSON.stringify(body);
      } else {
        rawText = await res.text().catch(() => null);
      }

      const respText = rawText ?? "OK";
      addCmd({ ...entryBase, status: "ok", resp: respText });
      addLog("info", `Bridge przyjął komendę: ${cmd}`);
      showSuccess(`Wysłano komendę: ${cmd}`);

      let parsed: { num: number; unit: string } | null = null;
      if (body && typeof body === "object" && typeof body.response === "string") {
        parsed = extractWeightFromString(body.response);
        if (parsed) {
          addLog("info", `Znaleziono wagę w body.response: ${body.response}`);
        }
      }
      if (!parsed && typeof rawText === "string") {
        parsed = extractWeightFromString(rawText);
        if (parsed) {
          addLog("info", `Znaleziono wagę w raw text response`);
        }
      }

      if (parsed) {
        setWeight(parsed.num);
        setUnit(parsed.unit);
        pushReading(parsed.num);
        addLog("info", `Zaktualizowano wagę z odpowiedzi bridge: ${parsed.num} ${parsed.unit}`);
        showSuccess(`Odczyt: ${parsed.num} ${parsed.unit}`);
      } else {
        if (body && typeof body === "object") {
          addLog("info", `Odpowiedź bridge (bez wagi): ${JSON.stringify(body).slice(0, 500)}`);
        } else {
          addLog("info", `Odpowiedź bridge (tekst): ${String(rawText).slice(0, 500)}`);
        }
      }
    } catch (e) {
      addCmd({ ...entryBase, status: "error", resp: String(e) });
      addLog("error", `Błąd wysyłania komendy przez bridge: ${String(e)}`);
      showError("Nie udało się wysłać komendy przez bridge");
    }
  };

  // Auto-connect on mount and whenever wsUrl changes (restart connection)
  React.useEffect(() => {
    connect();
    return () => {
      manualDisconnect.current = true;
      disconnect(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl]);

  const clearReadings = () => {
    setReadings([]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const clearCmdHistory = () => {
    setCmdHistory([]);
  };

  const setWsUrl = (s: string) => setWsUrlState(s);
  const setBridgeUrl = (s: string) => setBridgeUrlState(s);

  return {
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
    setWsUrl,
    setBridgeUrl,
    connect,
    disconnect,
    sendCommand,
    clearReadings,
    clearLogs,
    clearCmdHistory,
  };
}