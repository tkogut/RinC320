"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Host, Protocol } from "@/types";
import { protocolCommands } from "@/config/protocols";

const POLLING_INTERVAL_MS = 2000; // Poll every 2 seconds

export type ScaleIndication = {
  weight: number | null;
  unit: string;
  status: "ok" | "error" | "loading";
};

export function useScaleIndication(host: Host | null, protocol: Protocol): ScaleIndication {
  const [weight, setWeight] = useState<number | null>(null);
  const [unit, setUnit] = useState<string>("kg");
  const [status, setStatus] = useState<"ok" | "error" | "loading">("loading");

  const intervalRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const extractWeightFromString = (s?: string | null): { num: number; unit: string } | null => {
    if (!s) return null;
    const str = String(s);
    const tokenRe = /([+-]?\s*\d+(?:[.,]\d+)?)(?:\s*(kg|g|lb|lbs|oz))?/gi;
    let match: RegExpExecArray | null;
    const withUnitTokens: Array<{ raw: string; unit: string }> = [];
    while ((match = tokenRe.exec(str)) !== null) {
      const unit = match[2]?.toLowerCase();
      if (unit) withUnitTokens.push({ raw: match[1], unit });
    }
    if (withUnitTokens.length > 0) {
      const chosen = withUnitTokens[withUnitTokens.length - 1];
      const cleaned = chosen.raw.replace(/\s+/g, "").replace(",", ".");
      const num = parseFloat(cleaned);
      if (!isNaN(num)) return { num, unit: chosen.unit };
    }
    const numMatch = str.match(/[+-]?\d+(?:[.,]\d+)?/g);
    if (numMatch) {
      const lastNumStr = numMatch[numMatch.length - 1].replace(",", ".");
      const num = parseFloat(lastNumStr);
      if (!isNaN(num)) return { num, unit: "kg" };
    }
    return null;
  };

  const fetchWeight = useCallback(async () => {
    if (!host) {
      setStatus("error");
      return;
    }
    try {
      const readCommand = protocolCommands[protocol]?.read || "READ";
      const res = await fetch('/api/scalecmd', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: readCommand, ipAddress: host.ipAddress, port: host.port }),
      });

      if (!isMountedRef.current) return;

      if (!res.ok) {
        setStatus("error");
        return;
      }

      const body = await res.json().catch(() => null);
      const responseString = body?.response || (typeof body === 'string' ? body : '');
      const parsed = extractWeightFromString(responseString);

      if (parsed) {
        setWeight(parsed.num);
        setUnit(parsed.unit);
        setStatus("ok");
      } else {
        // Keep last known weight but indicate an issue
        setStatus("error");
      }
    } catch (e) {
      if (isMountedRef.current) {
        setStatus("error");
      }
    }
  }, [host, protocol]);

  useEffect(() => {
    isMountedRef.current = true;
    
    fetchWeight(); // Initial fetch
    intervalRef.current = window.setInterval(fetchWeight, POLLING_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [fetchWeight]);

  return { weight, unit, status };
}