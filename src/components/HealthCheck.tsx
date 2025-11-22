"use client";

import React from "react";
import { showSuccess, showError } from "@/utils/toast";

type Props = {
  bridgeUrl?: string; // used to derive health URL if healthUrl not provided
  healthUrl?: string;
  pollIntervalMs?: number;
};

type Status = "unknown" | "checking" | "healthy" | "unhealthy" | "error" | "mock";

const DEFAULT_POLL_MS = 5000;
const REQUEST_TIMEOUT_MS = 5000;

function deriveHealthUrl(bridgeUrl?: string, override?: string) {
  if (override) return override;
  if (!bridgeUrl) return "/api/health";

  // Handle proxied path
  if (bridgeUrl.startsWith('/api')) {
    return '/api/health';
  }

  try {
    // If bridgeUrl is a normal http(s) URL, use its origin + /health
    const u = new URL(bridgeUrl);
    return `${u.origin}/health`;
  } catch {
    // fallback
    return "/api/health";
  }
}

const HealthCheck: React.FC<Props> = ({ bridgeUrl, healthUrl, pollIntervalMs = DEFAULT_POLL_MS }) => {
  const [status, setStatus] = React.useState<Status>("unknown");
  const [code, setCode] = React.useState<number | null>(null);
  const [bodySnippet, setBodySnippet] = React.useState<string | null>(null);
  const [lastChecked, setLastChecked] = React.useState<number | null>(null);
  const [polling, setPolling] = React.useState(false);

  const effectiveUrl = deriveHealthUrl(bridgeUrl, healthUrl);

  const controllerRef = React.useRef<AbortController | null>(null);
  const intervalRef = React.useRef<number | null>(null);

  const doCheck = React.useCallback(async (silent = false) => {
    if (effectiveUrl.startsWith("mock://")) {
      setStatus("mock");
      setCode(null);
      setBodySnippet("mock: ok");
      setLastChecked(Date.now());
      if (!silent) showSuccess("Health (mock) OK");
      return;
    }

    setStatus("checking");
    setCode(null);
    setBodySnippet(null);

    controllerRef.current?.abort();
    const ctrl = new AbortController();
    controllerRef.current = ctrl;

    const timeout = setTimeout(() => {
      try {
        ctrl.abort();
      } catch {}
    }, REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(effectiveUrl, { signal: ctrl.signal, cache: "no-store" });
      clearTimeout(timeout);
      const txt = await res.text().catch(() => "");
      const snippet = txt ? txt.slice(0, 500) : "";
      setCode(res.status);
      setBodySnippet(snippet || null);
      setLastChecked(Date.now());
      if (res.ok) {
        setStatus("healthy");
        if (!silent) showSuccess(`Health OK (${res.status})`);
      } else {
        setStatus("unhealthy");
        if (!silent) showError(`Health returned ${res.status}`);
      }
    } catch (e: any) {
      clearTimeout(timeout);
      setStatus("error");
      setCode(null);
      setBodySnippet(String(e).slice(0, 500));
      setLastChecked(Date.now());
      if (!silent) showError(`Health check failed`);
    }

    return () => {
      try {
        clearTimeout(timeout);
      } catch {}
    };
  }, [effectiveUrl]);

  React.useEffect(() => {
    return () => {
      // cleanup on unmount
      controllerRef.current?.abort();
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const startPolling = React.useCallback(() => {
    if (polling) return;
    setPolling(true);
    // run an immediate check then schedule
    doCheck(true);
    intervalRef.current = window.setInterval(() => {
      doCheck(true);
    }, Math.max(1000, pollIntervalMs));
    showSuccess("Started health polling");
  }, [doCheck, pollIntervalMs, polling]);

  const stopPolling = React.useCallback(() => {
    if (!polling) return;
    setPolling(false);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    showSuccess("Stopped health polling");
  }, [polling]);

  return (
    <div className="mb-4 p-3 border rounded bg-white">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium">Health check</div>
          <div className="text-xs text-gray-500">Endpoint: <span className="break-words">{effectiveUrl}</span></div>
        </div>
        <div className="text-sm">
          <span
            className={`inline-block w-3 h-3 rounded-full mr-2 ${status === "healthy" || status === "mock" ? "bg-green-500" : status === "checking" ? "bg-yellow-400" : "bg-red-500"}`}
            title={status}
          />
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600 space-y-2">
        <div>Stan: <span className="font-medium capitalize">{status}</span></div>
        <div>Kod: <span className="font-mono">{code ?? "-"}</span></div>
        <div>Ostatnio: <span>{lastChecked ? new Date(lastChecked).toLocaleString() : "-"}</span></div>
        {bodySnippet ? <pre className="mt-2 p-2 bg-gray-50 rounded text-xs max-h-24 overflow-auto">{bodySnippet}</pre> : null}
      </div>

      <div className="mt-3 flex gap-2 flex-wrap">
        <button
          onClick={() => doCheck(false)}
          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
        >
          Check Now
        </button>
        <button
          onClick={() => {
            if (polling) stopPolling();
            else startPolling();
          }}
          className={`px-3 py-1 rounded text-sm ${polling ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"}`}
        >
          {polling ? "Stop Polling" : "Start Polling"}
        </button>
        <button
          onClick={() => {
            // quick copy to clipboard
            const text = `${effectiveUrl} -> status: ${status} code: ${code ?? "-"} last: ${lastChecked ? new Date(lastChecked).toISOString() : "-"}`;
            navigator.clipboard?.writeText(text).then(() => {
              showSuccess("Health info copied");
            }).catch(() => {
              showError("Couldn't copy health info");
            });
          }}
          className="px-2 py-1 bg-gray-100 rounded text-sm"
        >
          Copy
        </button>
      </div>
      {status === "error" && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
          <div className="text-sm font-medium text-red-800">Bridge jest niedostępny</div>
          <p className="mt-1 text-xs text-red-700">
            Wygląda na to, że serwer bridge'a nie jest uruchomiony. Otwórz terminal w folderze projektu
            i uruchom go komendą:
          </p>
          <pre className="mt-2 p-2 bg-gray-800 text-white rounded text-xs font-mono">
            node bridge.js
          </pre>
        </div>
      )}
    </div>
  );
};

export default HealthCheck;