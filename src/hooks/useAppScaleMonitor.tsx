"use client";

import React from "react";
import { showSuccess, showError } from "@/utils/toast";
import type { Reading, LogEntry, CmdEntry, Host } from "@/types";

const HISTORY_LIMIT = 200;
const LOG_LIMIT = 500;
const CMD_HISTORY_LIMIT = 100;

export type AppScaleMonitorApi = {
  weight: number | null;
  unit: string;
  status: string;
  raw: string;
  readings: Reading[];
  logs: LogEntry[];
  cmdHistory: CmdEntry[];
  sendCommand: (cmd: string) => Promise<void>;
  clearReadings: () => void;
  clearLogs: () => void;
  clearCmdHistory: () => void;
};

export function useAppScaleMonitor(host: Host | null): AppScaleMonitorApi {
  const [weight, setWeight] = React.useState<number | null>(null);
  const [unit, setUnit] = React.useState<string>("kg");
  const [status, setStatus] = React.useState<string>("Brak danych");
  const [raw, setRaw] = React.useState<string>("");
  const [readings, setReadings] = React.useState<Reading[]>([]);
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [cmdHistory, setCmdHistory] = React.useState<CmdEntry[]>([]);

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

  const pushReading = (w: number | null) => {
    setReadings((prev) => {
      const next = [...prev, { ts: Date.now(), weight: w }];
      if (next.length > HISTORY_LIMIT) {
        next.shift();
      }
      return next;
    });
  };

  const extractWeightFromString = (s?: string | null): { num: number; unit: string } | null => {
    if (!s) return null;
    const str = String(s);

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

    if (withUnitTokens.length > 0) {
      const chosen = withUnitTokens[withUnitTokens.length - 1];
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

    const colonRe = /:\s*([+-]?)\s*([0-9]+(?:[.,][0-9]+)?)/;
    const colonMatch = str.match(colonRe);
    if (colonMatch && colonMatch[2]) {
      const signPart = colonMatch[1] || "";
      const numPart = colonMatch[2];
      const rawNum = `${signPart}${numPart}`.replace(",", ".");
      const num = parseFloat(rawNum);
      if (!isNaN(num)) {
        const colonIndex = colonMatch.index ?? str.indexOf(":");
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

    if (numericTokens.length > 0) {
      const last = numericTokens[numericTokens.length - 1];
      const cleaned = last.raw.replace(/\s+/g, "");
      const num = parseFloat(cleaned.replace(",", "."));
      if (isNaN(num)) return null;
      return { num, unit: "kg" };
    }

    return null;
  };

  const sendCommand = async (cmd: string) => {
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
        body: JSON.stringify({
          command: cmd,
          ipAddress: host.ipAddress,
          port: host.port,
        }),
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
      addLog("info", `Bridge przyjął komendę: ${cmd}`);
      showSuccess(`Wysłano komendę: ${cmd}`);
      
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
  };

  const clearReadings = () => setReadings([]);
  const clearLogs = () => setLogs([]);
  const clearCmdHistory = () => setCmdHistory([]);

  return {
    weight, unit, status, raw, readings, logs, cmdHistory,
    sendCommand, clearReadings, clearLogs, clearCmdHistory,
  };
}