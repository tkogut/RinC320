"use client";

import React from "react";

type CmdEntry = {
  ts: number;
  cmd: string;
  status: "sent" | "ok" | "error";
  resp?: string;
};

type Props = {
  onSend: (cmd: string) => Promise<void>;
  history: CmdEntry[];
  onClear: () => void;
};

const CommandPanel: React.FC<Props> = ({ onSend, history, onClear }) => {
  const [value, setValue] = React.useState("");

  const send = async () => {
    if (!value.trim()) return;
    await onSend(value.trim());
    setValue("");
  };

  return (
    <div className="mt-4 border rounded bg-white p-3">
      <div className="text-sm font-medium mb-2">Ręczne komendy</div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1 text-sm"
          placeholder="np. tare / zero / read_gross"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />
        <button onClick={send} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Wyślij</button>
        <button onClick={onClear} className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm">Wyczyść</button>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        <div className="flex items-center justify-between mb-2">
          <div>Ostatnie komendy</div>
          <div className="text-gray-400">{history.length}</div>
        </div>

        {history.length === 0 ? (
          <div className="text-gray-400">Brak wysłanych komend</div>
        ) : (
          <div className="max-h-36 overflow-auto font-mono text-xs space-y-1">
            {history.slice().reverse().map((h, i) => (
              <div key={i} className="flex items-start justify-between gap-2">
                <div className="flex-1 break-words">
                  <div className="text-gray-500">{new Date(h.ts).toLocaleTimeString()}</div>
                  <div>
                    <span className="font-medium">{h.cmd}</span>
                    <span className={`ml-2 ${h.status === "ok" ? "text-green-600" : h.status === "error" ? "text-red-600" : "text-gray-500"}`}>
                      {h.status}
                    </span>
                  </div>
                  {h.resp ? <div className="text-gray-600 mt-1 text-xs break-words">{h.resp}</div> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandPanel;