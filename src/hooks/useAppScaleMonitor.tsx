"use client";

import React from "react";
import { showSuccess, showError } from "@/utils/toast";
import type { Reading, LogEntry, CmdEntry, Host, Protocol } from "@/types";

const HISTORY_LIMIT = 200;
const LOG_LIMIT = 500;
const CMD_HISTORY_LIMIT = 100;
const CONTINUOUS_INTERVAL_MS = 1000;

export type AppScaleMonitorApi = {
  weight: number | null;
  unit: string;
  status: string;
  raw: string;
  readings: Reading[];
  logs: LogEntry[];
  cmdHistory: CmdEntry[];
  isPolling: boolean;
  sendCommand: (cmd: string) => Promise<void>;
  clearReadings: () => void;
  clearLogs: () => void;
  clearCmdHistory: () => void;
  startPolling: () => void;
  stopPolling: () => void;
};

export function useAppScaleMonitor(host: Host | null, protocol: Protocol | undefined): AppScaleMonitorApi {
  const [weight, setWeight] = React.useState<number | null>(null);
  const [unit, setUnit] = React.useState<string>("kg");
  const [status, setStatus] = React.useState<string>("Brak danych");
  const [raw, setRaw] = React.useState<string>("");
  const [readings, setReadings] = React.useState<Reading[]>([]);
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [cmdHistory, setCmdHistory] = React.useState<CmdEntry[]>([]);
  const [isPolling, setIsPolling] = React.useState(false);

  const pollingControl = React.useRef<{ running: boolean; timeoutId: number | null }>({
    running: false,
    timeoutId: null,
  });

  const addLog = (level: LogEntry["level"], message: string) => {
    setLogs((prev) => {
      const next = [...prev, { ts: Date.now(), level, message }];
      if (next.length > LOG_LIMIT) next.splice(0, next.length - LOG_LIMIT);
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

  const pushReading = (w: number | null) => {
    setReadings((prev) => {
      const next = [...prev, { ts: Date.now(), weight: w }];
      if (next.length > HISTORY_LIMIT) next.shift();
      return next;
    });
  };

  const extractWeightFromString = (s?: string | null): { num: number; unit: string } | null => {
    if (!s) return null;
    const str = String(s);
    const tokenRe = /([+-]?\s*\d+(?:[.,]\d+)?)(?:\s*(kg|g|lb|lbs|oz))?/gi;
    let match: RegExpExecArray | null;
    const withUnitTokens: Array<{ raw: string; unit: string; index: number }> = [];
    while ((match = tokenRe.exec(str)) !== null) {
      const unit = match[2]?.toLowerCase();
      if (unit) withUnitTokens.push({ raw: match[1], unit, index: match.index });
    }
    if (withUnitTokens.length > 0) {
      const chosen = withUnitTokens[withUnitTokens.length - 1];
      const cleaned = chosen.raw.replace(/\s+/g, "").replace(",", ".");
      const num = parseFloat(cleaned);
      if (isNaN(num)) return null;
      return { num, unit: chosen.unit };
    }
    const numMatch = str.match(/[+-]?\d+(?:[.,]\d+)?/g);
    if (numMatch) {
      const lastNumStr = numMatch[numMatch.length - 1].replace(",", ".");
      const num = parseFloat(lastNumStr);
      if (!isNaN(num)) return { num, unit: "kg" };
    }
    return null;
  };

  const sendCommand = React.useCallback(async (cmd: string) => {
    if (!host) {
      showError("Host nie jest zdefiniowany. Nie można wysłać komendy.");
      addLog("error", "Próba wysłania komendy bez zdefiniowanego hosta.");
      return;
    }
    const entryBase: CmdEntry = { ts: Date.now(), cmd, status: "sent" };
    addCmd(entryBase);
    try {
      addLog("info", `Wysyłam komendę "${cmd}" do hosta ${host.name} (${host.ipAddress}:${host.port})`);
      const res = await fetch('/api/scalecmd', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd, ipAddress: host.ipAddress, port: host.port }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        addCmd({ ...entryBase, status: "error", resp: `HTTP ${res.status}: ${text}` });
        addLog("error", `Bridge zwrócił błąd ${res.status}: ${text}`);
        showError(`Błąd serwera bridge: ${res.status}`);
        setStatus(`Błąd ${res.status}`);
        return;
      }
      const body = await res.json().catch(() => null);
      const respText = body ? JSON.stringify(body) : "OK";
      addCmd({ ...entryBase, status: "ok", resp: respText });
      if (!isPolling) showSuccess(`Wysłano komendę: ${cmd}`);
      const responseString = body?.response || (typeof body === 'string' ? body : '');
      setRaw(responseString);
      const parsed = extractWeightFromString(responseString);
      if (parsed) {
        setWeight(parsed.num);
        setUnit(parsed.unit);
        pushReading(parsed.num);
        setStatus("Stabilna");
        addLog("info", `Zaktualizowano wagę z odpowiedzi: ${parsed.num} ${parsed.unit}`);
      } else {
        addLog("info", `Odpowiedź bridge nie zawierała wagi: ${responseString.slice(0, 200)}`);
      }
    } catch (e: any) {
      addCmd({ ...entryBase, status: "error", resp: String(e) });
      addLog("error", `Błąd wysyłania komendy przez bridge: ${String(e)}`);
      showError("Nie udało się wysłać komendy przez bridge");
      setStatus("Błąd połączenia");
    }
  }, [host, isPolling]);

  const sendCommandRef = React.useRef(sendCommand);
  React.useEffect(() => { sendCommandRef.current = sendCommand; }, [sendCommand]);

  const stopPolling = React.useCallback(() => {
    if (pollingControl.current.timeoutId) clearTimeout(pollingControl.current.timeoutId);
    pollingControl.current.running = false;
    pollingControl.current.timeoutId = null;
    if (isPolling) {
      setIsPolling(false);
      addLog("info", "Zatrzymano ciągły odczyt.");
      showSuccess("Ciągły odczyt zatrzymany");
    }
  }, [isPolling]);

  const startPolling = React.useCallback(() => {
    if (pollingControl.current.running) return;
    pollingControl.current.running = true;
    setIsPolling(true);
    addLog("info", "Uruchomiono ciągły odczyt.");
    showSuccess("Ciągły odczyt rozpoczęty");

    const getReadCommand = () => {
      if (protocol === 'rinstrum_c320') return "20050026:";
      return "READ";
    };

    const loop = async () => {
      if (!pollingControl.current.running) return;
      try {
        await sendCommandRef.current(getReadCommand());
      } catch {}
      if (pollingControl.current.running) {
        pollingControl.current.timeoutId = window.setTimeout(loop, CONTINUOUS_INTERVAL_MS);
      }
    };
    loop();
  }, [protocol]);

  React.useEffect(() => { return () => stopPolling(); }, [stopPolling]);

  return {
    weight, unit, status, raw, readings, logs, cmdHistory, isPolling,
    sendCommand,
    clearReadings: () => setReadings([]),
    clearLogs: () => setLogs([]),
    clearCmdHistory: () => setCmdHistory([]),
    startPolling,
    stopPolling,
  };
}