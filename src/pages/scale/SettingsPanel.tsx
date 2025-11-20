import React from "react";

type Props = {
  wsUrl: string;
  onChange: (newUrl: string) => void;
};

const STORAGE_KEY = "scale_ws_url";

const SettingsPanel: React.FC<Props> = ({ wsUrl, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(wsUrl);

  React.useEffect(() => {
    setValue(wsUrl);
  }, [wsUrl]);

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      // ignore
    }
    onChange(value);
    setOpen(false);
  };

  const restoreFromStorage = () => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v) {
        setValue(v);
        onChange(v);
      }
    } catch (e) {
      // ignore
    }
    setOpen(false);
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
          <label className="block text-xs text-gray-600">WebSocket URL</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="ws://localhost:3001"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={restoreFromStorage}
              className="px-3 py-1 bg-gray-200 rounded text-sm"
            >
              Przywróć z pamięci
            </button>
            <button
              onClick={() => {
                setValue(wsUrl);
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
        <div className="mt-2 text-sm text-gray-600">Aktualny WS: {wsUrl}</div>
      )}
    </div>
  );
};

export default SettingsPanel;